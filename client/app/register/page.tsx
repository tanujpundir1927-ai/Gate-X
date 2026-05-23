"use client";

import { useState } from "react";

export default function RegisterPage() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    collegeId: "",
    branch: "",
    password: "",
  });

  const [qrImage, setQrImage] = useState("");

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {

    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.collegeId ||
      !formData.branch ||
      !formData.password
    ) {
      alert("Please Fill All Fields");
      return;
    }

    try {

      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      alert(data.message);

      setQrImage(data.qrCode);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="bg-[#07152d] p-10 rounded-2xl w-[400px]">

        <h1 className="text-5xl font-bold text-cyan-400 text-center mb-8">
          GateX Register
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <input
            type="text"
            name="name"
            placeholder="Enter Full Name"
            onChange={handleChange}
            className="p-4 rounded-xl bg-black text-white border border-gray-700 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
            className="p-4 rounded-xl bg-black text-white border border-gray-700 outline-none"
          />

          <input
            type="text"
            name="collegeId"
            placeholder="College ID"
            onChange={handleChange}
            className="p-4 rounded-xl bg-black text-white border border-gray-700 outline-none"
          />

          <input
            type="text"
            name="branch"
            placeholder="Branch"
            onChange={handleChange}
            className="p-4 rounded-xl bg-black text-white border border-gray-700 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
            className="p-4 rounded-xl bg-black text-white border border-gray-700 outline-none"
          />

          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl text-xl"
          >
            Register
          </button>

        </form>

        {
          qrImage && (
            <div className="mt-6 flex justify-center">
              <img
                src={qrImage}
                alt="QR Code"
                className="w-52 h-52 bg-white p-2 rounded-xl"
              />
            </div>
          )
        }

      </div>

    </div>
  );
}
