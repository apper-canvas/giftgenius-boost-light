import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PriceAlerts from "@/components/pages/PriceAlerts";
import Layout from "@/components/organisms/Layout";
import Home from "@/components/pages/Home";
import Recipients from "@/components/pages/Recipients";
import Reminders from "@/components/pages/Reminders";
import Saved from "@/components/pages/Saved";
import GroupGifts from "@/components/pages/GroupGifts";
import SocialGifting from "@/components/pages/SocialGifting";
import DIYInstructions from "@/components/pages/DIYInstructions";
import Trends from "@/components/pages/Trends";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="recipients" element={<Recipients />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="saved" element={<Saved />} />
            <Route path="price-alerts" element={<PriceAlerts />} />
            <Route path="group-gifts" element={<GroupGifts />} />
            <Route path="social" element={<SocialGifting />} />
<Route path="diy-instructions/:id" element={<DIYInstructions />} />
            <Route path="trends" element={<Trends />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;