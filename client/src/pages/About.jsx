import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-paper px-6 py-16 md:px-16 lg:px-28">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="eyebrow">Our story</p>
        <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">About Erimuga</h1>
      </motion.div>

      <motion.div
        className="mx-auto max-w-3xl space-y-6 text-[1.05rem] leading-[1.9] text-ink-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p>
          At <span className="font-medium text-ink">Erimuga</span>, we celebrate the timeless beauty of{" "}
          <span className="italic">Assamese sarees</span> and the soulful art of Indian handlooms. Our
          journey began with a simple dream — to bring the warmth of handcrafted traditions into the
          hearts and homes of people across the world.
        </p>
        <p>
          Every thread we showcase tells a story — of artisans who weave with love, of heritage passed
          down through generations, and of fabrics that carry the fragrance of the soil they were born
          from. Our mission is to not only offer you exquisite sarees and handlooms, but also to
          preserve the craft and empower the hands that create them.
        </p>
        <p>
          While our roots are firmly in Assam, our vision is expansive. We're working towards embracing
          and curating handlooms from every corner of India, bringing together a tapestry of cultures,
          colors, and textures. At Erimuga, every piece is more than a product — it's a promise of
          authenticity, sustainability, and artistry.
        </p>
      </motion.div>

      <motion.div
        className="mx-auto mt-14 max-w-3xl bg-ink px-8 py-10 text-paper"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="font-display text-3xl">Our Philosophy</h2>
        <p className="mt-4 text-[1.05rem] leading-[1.9] text-paper/85">
          We believe in slowing down in a fast-paced world — choosing quality over quantity, stories
          over trends, and people over profit. Every saree and handloom in our collection is ethically
          sourced, crafted with patience, and designed to last for generations.
        </p>
      </motion.div>

      <motion.div
        className="mx-auto mt-14 max-w-3xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="font-display text-2xl italic text-ink-soft sm:text-3xl">
          "When you drape an Erimuga saree, you don't just wear fabric — you wear history, you wear
          art, you wear love."
        </p>
      </motion.div>
    </div>
  );
};

export default About;
