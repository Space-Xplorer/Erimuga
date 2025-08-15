import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="bg-[#fffaf5] min-h-screen py-12 px-6 md:px-16 lg:px-28">
      
      {/* Heading with Logo */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/Logos/Logo.jpg" alt="Erimuga Logo" className="h-14 mx-auto mb-4 rounded" />
        <h1 className="text-4xl font-bold text-[#b22222]">About Erimuga</h1>
      </motion.div>

      {/* Story Section */}
      <motion.div 
        className="max-w-5xl mx-auto space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-lg leading-relaxed text-gray-800">
          At <span className="font-semibold text-[#b22222]">Erimuga</span>, we
          celebrate the timeless beauty of <span className="italic">Assamese sarees</span> 
          and the soulful art of Indian handlooms. Our journey began with a simple dream — 
          to bring the warmth of handcrafted traditions into the hearts and homes of people
          across the world.
        </p>

        <p className="text-lg leading-relaxed text-gray-800">
          Every thread we showcase tells a story — of artisans who weave with love,
          of heritage passed down through generations, and of fabrics that carry
          the fragrance of the soil they were born from. Our mission is to not only
          offer you exquisite sarees and handlooms, but also to preserve the craft
          and empower the hands that create them.
        </p>

        <p className="text-lg leading-relaxed text-gray-800">
          While our roots are firmly in Assam, our vision is expansive. We’re
          working towards embracing and curating handlooms from every corner of
          India, bringing together a tapestry of cultures, colors, and textures.
          At Erimuga, every piece is more than a product — it’s a promise of
          authenticity, sustainability, and artistry.
        </p>
      </motion.div>

      {/* Philosophy Highlight */}
      <motion.div 
        className="bg-[#b22222] text-white py-10 px-6 mt-12 rounded-2xl shadow-lg max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Our Philosophy</h2>
        <p className="text-lg leading-relaxed">
          We believe in slowing down in a fast-paced world — choosing quality over
          quantity, stories over trends, and people over profit. Every saree and
          handloom in our collection is ethically sourced, crafted with patience,
          and designed to last for generations.
        </p>
      </motion.div>

      {/* Closing Note */}
      <motion.div 
        className="max-w-5xl mx-auto mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="text-xl italic text-gray-700">
          “When you drape an Erimuga saree, you don’t just wear fabric — you wear
          history, you wear art, you wear love.”
        </p>
      </motion.div>
    </div>
  );
};

export default About;
