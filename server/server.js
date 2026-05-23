const QRCode = require("qrcode");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GateX Server Running");
});

app.post("/api/register", async (req, res) => {

  const { name, email, collegeId, branch, password } = req.body;

  if (!name || !email || !collegeId || !branch || !password) {

    return res.status(400).json({
      message: "Please Fill All Fields",
    });

  }

  const studentData = {
    name,
    email,
    collegeId,
    branch,
  };

  const qrCode = await QRCode.toDataURL(
    JSON.stringify(studentData)
  );

  console.log(studentData);

  res.json({
    message: "User Registered Successfully",
    qrCode,
  });

});
    
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
