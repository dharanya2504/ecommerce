import React from 'react';
import { motion } from 'framer-motion';

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blob 1 */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px]"
        initial={{ x: -100, y: -100 }}
        animate={{
          x: [ -100, 100, -50, -100 ],
          y: [ -100, 50, 100, -100 ],
          scale: [ 1, 1.2, 0.9, 1 ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%', left: '5%' }}
      />

      {/* Blob 2 */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]"
        initial={{ x: 200, y: 300 }}
        animate={{
          x: [ 200, -50, 100, 200 ],
          y: [ 300, 150, -50, 300 ],
          scale: [ 1, 0.8, 1.1, 1 ],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '15%', right: '10%' }}
      />

      {/* Blob 3 */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-neutral-grey/10 blur-[90px]"
        initial={{ x: 100, y: 100 }}
        animate={{
          x: [ 100, 300, 150, 100 ],
          y: [ 100, -100, 200, 100 ],
          scale: [ 1, 1.3, 0.8, 1 ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '40%', right: '30%' }}
      />
    </div>
  );
};

export default BackgroundBlobs;
