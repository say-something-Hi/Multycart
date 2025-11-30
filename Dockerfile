FROM node:18-alpine

WORKDIR /app

# শুধুমাত্র index.js কপি করুন
COPY index.js .

# প্রয়োজনীয় ডিরেক্টরি তৈরি করুন
RUN mkdir -p public/uploads data

# পোর্ট এক্সপোজ করুন
EXPOSE 3000

# অ্যাপ্লিকেশন শুরু করুন
CMD ["node", "index.js"]
