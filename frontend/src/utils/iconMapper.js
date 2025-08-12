// iconMapper.js
// iconMapper.js
import {
  SiReact,
  SiNodedotjs,
  SiJavascript,
  SiHtml5,
  SiCss3,
  SiTailwindcss,
} from "react-icons/si";

import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaCode,
  FaQuestion,
  FaFacebook,
} from "react-icons/fa";


// Normalize and match miswritten words
const normalize = (str) => str.toLowerCase().replace(/\s/g, "");

export const skillIconMap = {
  reactjs: SiReact,
  react: SiReact,
  reatjs: SiReact,
  nodejs: SiNodedotjs,
  node: SiNodedotjs,
  javascript: SiJavascript,
  js: SiJavascript,
  html: SiHtml5,
  css: SiCss3,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
};

export const interestIconMap = {
  coding: FaCode,
  development: FaCode,
  programming: FaCode,
  reactjs: SiReact,
};

export const socialIconMap = {
  github: FaGithub,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  facebook:FaFacebook
};

export const getSkillIcon = (skill) => {
  const normalized = normalize(skill);
  return skillIconMap[normalized] || FaQuestion;
};

export const getInterestIcon = (interest) => {
  const normalized = normalize(interest);
  return interestIconMap[normalized] || FaQuestion;
};

export const getSocialIcon = (platform) => {
  const normalized = normalize(platform);
  return socialIconMap[normalized] || FaQuestion;
};
