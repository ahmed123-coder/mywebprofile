import React, { useState, useEffect } from 'react';
import axios from 'axios';

import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import { NavBar } from "../components/NavBar";
import { Banner } from "../components/Banner";
import { Skills } from "../components/Skills";
import { Projects } from "../components/Projects";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";

const Home = () => {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://mywebprofile-1.onrender.com/api/site/selected");
        setSiteContent(response.data);
        console.log("Fetched site data:", response.data); // 🔍 لمراقبة البيانات
      } catch (error) {
        console.error("Error fetching site content:", error);
      }
    };
    fetchData();
  }, []);

  if (!siteContent) return <div>Loading...</div>; // عرض مؤقت حتى تحميل البيانات

  return (
    <div className="App">
      <NavBar 
        logo={siteContent.logoheader} 
        siteName={siteContent.siteName} 
      />
      <Banner 
        hero={siteContent.hero} 
        logohero={siteContent.logohero} 
      />
      <Skills />
      <Projects />
      <Contact 
        contactEmail={siteContent.contactEmail} 
        emailuser={siteContent.emailuser} 
        passworduser={siteContent.passworduser} 
      />
      <Footer footer={siteContent.footer} />
    </div>
  );
};

export default Home;
