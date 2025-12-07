const upload = require("./multer")
const router = require("express").Router()
const fs = require("fs");

const STOP_WORDS = [
    "and", "or", "the", "a", "an", "for", "with", "in", "on", "to", "from",
    "skills", "responsibilities", "experience", "summary", "profile",
    "projects", "education", "professional", "work", "role", "contact"
];

// Dynamic skill extraction
function extractSkills(text) {
    const lines = text.split("\n");
    let skills = [];
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith("-") || line.startsWith("•") || line.includes(",")) {
            const parts = line.replace(/[-•]/g, "").split(/,|\s{2,}/);
            parts.forEach(word => {
                word = word.trim();
                if (word.length > 2 && !STOP_WORDS.includes(word.toLowerCase())) skills.push(word);
            });
        }
    });
    // Remove duplicates
    skills = [...new Set(skills)];
    return skills;
}

// Extract structured fields
function extractFields(text) {
    text = text.replace(/\r/g, "\n"); // normalize line endings
    const result = {
        name: null,
        email: null,
        phone: null,
        education: [],
        experience: null,
        skills: []
    };

    // Name: first meaningful line (skip "Resume", "Curriculum Vitae" etc.)
    const lines = text.split("\n").map(l => l.trim()).filter(l => l && !["resume", "curriculum vitae", "cv"].includes(l.toLowerCase()));
    if (lines.length > 0) result.name = lines[0];

    // Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.email = emailMatch[0];

    // Phone
    const phoneMatch = text.match(/(\+?\d{1,4}[-\s]?)?[6-9]\d{9}/);
    if (phoneMatch) result.phone = phoneMatch[0];

    // Education
    const eduKeywords = ["bca", "mca", "b.tech", "m.tech", "ba", "ma", "bcom", "mcom", "b.sc", "m.sc", "mba", "diploma"];
    eduKeywords.forEach(edu => {
        if (text.toLowerCase().includes(edu)) result.education.push(edu.toUpperCase());
    });

    // Experience
    const expMatch = text.match(/(\d+\+?)\s+(year|years|yrs)/i);
    if (expMatch) result.experience = expMatch[0];

    // Skills
    result.skills = extractSkills(text);

    return result;
}

router.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        // Dynamically import pdfjs-dist for Node 22
        const pdfjsLibModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const pdfjsLib = pdfjsLibModule.getDocument ? pdfjsLibModule : pdfjsLibModule.default;

        // Read uploaded file
        const buffer = new Uint8Array(fs.readFileSync(req.file.path));

        // Parse PDF
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n";
        }

        console.log("===== PDF TEXT =====");
        console.log(text);
        const parsedData = extractFields(text);

        // Send extracted text as JSON
        res.status(200).json({ data: text });

    } catch (error) {
        console.error("Error parsing PDF:", error);
        res.status(500).json({ error: "Failed to parse PDF" });
    }
});

module.exports = router