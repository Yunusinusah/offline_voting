const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const db = require('../config/db');
const { sequelize, models } = db.orm;

exports.upload = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "Excel file required" });
    }

    // Validate file extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (![".xlsx", ".xls"].includes(fileExtension)) {
      return res
        .status(400)
        .json({ error: "Only Excel files (.xlsx, .xls) are allowed" });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);

    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with options for better parsing
    const records = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Get raw data first
      defval: "", // Default value for empty cells
      blankrows: false, // Skip blank rows
    });

    // If no data or only headers
    if (records.length <= 1) {
      return res
        .status(400)
        .json({ error: "Excel file contains no data rows" });
    }

    // Get headers from first row and normalize them
    const headers = records[0].map((header) =>
      String(header).toLowerCase().trim().replace(/\s+/g, "_")
    );

    // Convert remaining rows to objects
    const dataRows = records
      .slice(1)
      .map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] =
            row[index] !== undefined && row[index] !== null
              ? String(row[index]).trim()
              : "";
        });
        return obj;
      })
      .filter((row) => {
        // Filter out completely empty rows
        return Object.values(row).some((value) => value !== "");
      });

    if (dataRows.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid data rows found in Excel file" });
    }

    // Validate required columns
    const requiredColumns = ["student_id"];
    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        error: `Missing required columns: ${missingColumns.join(
          ", "
        )}. Found columns: ${headers.join(", ")}`,
      });
    }

    const toInsert = [];
    const errors = [];

    // Process each record
    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];

      try {
        // Validate student_id
        if (!r.student_id || r.student_id.trim() === "") {
          errors.push(`Row ${i + 2}: student_id is required`);
          continue;
        }

        // Use raw password; model hooks will hash on create/update
        const password =
          r.password && r.password.trim() !== ""
            ? r.password.trim()
            : "changeme";

        // Prepare record for insertion
        const record = {
          student_id: r.student_id.trim(),
          name: r.name && r.name.trim() !== "" ? r.name.trim() : null,
          email: r.email && r.email.trim() !== "" ? r.email.trim() : null,
          password: password,
          level: r.level && r.level.trim() !== "" ? r.level.trim() : null,
          gender: r.gender && r.gender.trim() !== "" ? r.gender.trim() : null,
          election_id: req.full_user.election_id,
        };

        toInsert.push(record);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation errors found",
        errors: errors.slice(0, 10), // Limit to first 10 errors
        totalErrors: errors.length,
      });
    }

    // Perform database transaction
    let insertedCount = 0;
    let updatedCount = 0;

    if (!sequelize || !models) throw new Error("ORM not initialized");
    await sequelize.transaction(async (trx) => {
      for (const v of toInsert) {
        try {
          const existing = await models.Voter.findOne({
            where: { student_id: v.student_id },
            transaction: trx,
          });
          if (existing) {
            // update instance to trigger hooks
            await existing.update(
              {
                password: v.password,
                name: v.name,
                email: v.email,
                level: v.level,
                gender: v.gender,
                election_id: req.full_user.election_id,
              },
              { transaction: trx }
            );
            updatedCount++;
                  // try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, voter_id: existing.id, action: 'update', details: `voter ${existing.id} updated via bulk upload` }, { transaction: trx }); } catch (e) { /* best effort */ }
          } else {
            await models.Voter.create(
              {
                student_id: v.student_id,
                name: v.name,
                email: v.email,
                password: v.password,
                level: v.level,
                gender: v.gender,
                election_id: req.full_user.election_id,
              },
              { transaction: trx }
            );
            insertedCount++;
          }
          try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, action: 'create', details: `voter ${existing ? 'updated' : 'created'} via bulk upload` }, { transaction: trx }); } catch (e) { /* best effort */ }
        } catch (dbError) {
          throw new Error(
            `Database error for student_id ${v.student_id}: ${dbError.message}`
          );
        }
      }
    });

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn("Failed to cleanup uploaded file:", cleanupError.message);
    }
    const voters = await models.Voter.findAll({
      where: { election_id: req.full_user.election_id },
    });
    // Return success response
    res.json({
      success: true,
      total: toInsert.length,
      inserted: insertedCount,
      updated: updatedCount,
      voters: voters.map((v) => v.toJSON()),
      message: `Successfully processed ${toInsert.length} records (${insertedCount} new, ${updatedCount} updated)`,
    });
  } catch (err) {
    console.error("Upload error:", err);

    // Clean up uploaded file in case of error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn(
          "Failed to cleanup uploaded file after error:",
          cleanupError.message
        );
      }
    }

    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "An error occurred while processing the file",
    });
  }
};

//get all voters
exports.list = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const rows = await models.Voter.findAll({
      where: { election_id: req.full_user.election_id },
    });
    res.json(rows.map((r) => r.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//create voter
exports.addSingle = async (req, res) => {
  try {
    const { student_id, name, email, level, gender } = req.body;
    if (!student_id || !name || !email || !level || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!models) throw new Error("ORM not initialized");
    const voter = await models.Voter.create({
      student_id,
      name,
      email,
      level,
      gender,
      election_id: req.full_user.election_id,
    });
    res
      .status(201)
      .json({ voter: voter.toJSON(), message: "Voter created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete all
exports.resetAll = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const deleted = await models.Voter.destroy({
      where: { election_id: req.full_user.election_id },
    });
    res.json({ success: true, message: `Deleted ${deleted} voters` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};