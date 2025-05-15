import React from 'react';
// import './Footer.css';

const Footer = () => {
  return (
    <div className="FooterContainer">
      <div
        className="FooterButton"
        onClick={() => {
          const firstPage = document.getElementById('firstPage');
          firstPage.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Travo와 여행 계획 시작하기
      </div>
      <img className="FooterLogo" src="/logo.png" />
      <div className="FooterGitHubId">github.com/NE-XTLEVEL</div>
    </div>
  );
};

export default Footer;
