// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Switch } from "../ui/switch";
// import { useTheme } from "../../Context/ThemeContext";

// const SettingsModal = ({ open, onClose }) => {
//   const { theme, toggleTheme } = useTheme(); // Ensure ThemeProvider is wrapping App
//   const [formData, setFormData] = useState({
//     username: "",
//     branch: "",
//     rollNo: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogContent className="p-6 rounded-xl bg-white dark:bg-gray-900">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-semibold text-black dark:text-white">
//             Settings
//           </DialogTitle>
//         </DialogHeader>
        
//         <div className="space-y-4">
//           {/* Username Input */}
//           <div>
//             <label className="block text-sm font-medium text-black dark:text-white">Username</label>
//             <Input
//               name="username"
//               className="w-full px-3 py-2 rounded-md border border-gray-400 bg-white text-black dark:text-black placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your username"
//               value={formData.username}
//               onChange={handleChange}
//               style={{ color: "black" }} // Ensures text remains black in all themes
//             />
//           </div>

//           {/* Branch Input */}
//           <div>
//             <label className="block text-sm font-medium text-black dark:text-white">Branch</label>
//             <Input
//               name="branch"
//               className="w-full px-3 py-2 rounded-md border border-gray-400 bg-white text-black dark:text-black placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your branch"
//               value={formData.branch}
//               onChange={handleChange}
//               style={{ color: "black" }}
//             />
//           </div>

//           {/* Roll No Input */}
//           <div>
//             <label className="block text-sm font-medium text-black dark:text-white">Roll No</label>
//             <Input
//               name="rollNo"
//               className="w-full px-3 py-2 rounded-md border border-gray-400 bg-white text-black dark:text-black placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your roll number"
//               value={formData.rollNo}
//               onChange={handleChange}
//               style={{ color: "black" }}
//             />
//           </div>

//           {/* Dark Mode Toggle */}
//           <div className="flex items-center justify-between mt-4">
//             <span className="text-sm text-black dark:text-white">Dark Mode</span>
//             <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
//           </div>
//         </div>

//         <DialogFooter className="flex justify-end space-x-2 mt-4">
//           <Button variant="outline" onClick={onClose} className="border-gray-500 text-black dark:text-white">
//             Cancel
//           </Button>
//           <Button className="bg-blue-500 text-white">Save Changes</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SettingsModal;

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { useTheme } from "../../Context/ThemeContext";

const SettingsModal = ({ open, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    username: "",
    branch: "",
    rollNo: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}> {/* This enables closing when clicking outside */}
      <DialogContent className="p-6 rounded-xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black dark:text-white">
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">Username</label>
            <Input
              name="username"
              className="w-full px-3 py-2 rounded-md border border-gray-400 bg-white text-black dark:text-black placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              style={{ color: "black" }}
            />
          </div>

          {/* Branch Input */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">Branch</label>
            <Input
              name="branch"
              className="w-full px-3 py-2 rounded-md border border-gray-400 bg-white text-black dark:text-black placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your branch"
              value={formData.branch}
              onChange={handleChange}
              style={{ color: "black" }}
            />
          </div>

          {/* Roll No Input */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">Roll No</label>
            <Input
              name="rollNo"
              className="w-full px-3 py-2 rounded-md border border-gray-400 bg-white text-black dark:text-black placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your roll number"
              value={formData.rollNo}
              onChange={handleChange}
              style={{ color: "black" }}
            />
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-black dark:text-white">Dark Mode</span>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose} className="border-gray-500 text-black dark:text-white">
            Cancel
          </Button>
          <Button className="bg-blue-500 text-white">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
