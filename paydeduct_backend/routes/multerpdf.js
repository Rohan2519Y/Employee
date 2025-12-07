const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/pdf");
    },
    filename: (req, file, cb) => {
        const myFile = file.originalname
        cb(null, myFile);
    },
});

const upload = multer({ storage: storage });
module.exports = upload;
