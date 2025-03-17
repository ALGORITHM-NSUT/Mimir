import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginButton from '../components/LandingPageComponents/LoginButton';
import FloatingBackground from '../components/Utility/FloatingBackground';


const LoginPage = () => {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const navigate = useNavigate()
  

  return (
    <div className=" flex justify-center bg-gray-950 items-center h-screen relative">
      {/* <FloatingBackground /> */}
      <nav className='flex w-full top-0 left-0 fixed px-6 py-4 z-50 bg-transparent'>
      <div className="flex justify-center items-center cursor-pointer" onClick={()=>{navigate("/")}}>
          <img src="Mimir_logo.png" alt="Mimir Logo" className="h-10 w-auto" />
          <h1 className="text-2xl text-gray-200 font-semibold">Mimir</h1>
        </div>
      </nav>
      <div className="w-full max-w-4xl grid grid-cols-1 mx-4 md:grid-cols-2 rounded-3xl shadow-lg overflow-hidden z-50">
        {/* Left side: Login form */}
        <div className="bg-white p-8 md:p-10 flex flex-col justify-center">
          <form className="space-y-6" >
            <h5 className="text-2xl text-center font-bold text-gray-900">
              Welcome
            </h5>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-900">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-2.5 border rounded-2xl text-gray-900 bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="rollNumber" className="block mb-2 text-sm font-semibold text-gray-900">
                Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                className="w-full p-2.5 border rounded-2xl text-gray-900 bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>
            
            <LoginButton />
          </form>
        </div>

        {/* Right side */}
        <div className="hidden md:flex md:flex-col md:justify-center md:items-center bg-gradient-to-br from-purple-900 to-blue-900 via-[#0b0b0b] p-8">
          <div className="relative z-10 flex flex-col mt-4 items-center mb-8 ">
            <div className="flex flex-col items-center justify-center">
              <img src="Mimir_logo.png" alt="Mimir Logo" className="h-40 w-auto" />
              <h1 className="text-[2rem] sm:text-[4rem] md:text-[5rem] lg:text-[4rem] text-gray-200 font-bold font-sans">
                Mimir
              </h1>
            </div>
            <div className="text-gray-300 font-bold text-center mb-4">
              <p className="text-xl lg:text-3xl">By</p>
            </div>
            <div className="text-gray-300 font-bold text-center mb-4 flex gap-2">
              <img src="/algo.png" alt="" className='h-10 w-auto' />
              <p className="text-xl lg:text-3xl"> Algorithm</p>
            </div>
         
          </div>
        </div>
      </div>
    
   
    </div>
  );
};

export default LoginPage;
