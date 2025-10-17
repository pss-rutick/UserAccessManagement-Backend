const { db, FieldValue } = require('../config/firebase-config');
const fs = require('fs').promises;

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

async function uploadBlogs() {
  try {
    const rawData = await fs.readFile('./src/data/blogs.json', 'utf8');
    const blogs = JSON.parse(rawData);

    const batch = db.batch();
    let count = 0;

    for (const blog of blogs) {
      const docRef = db.collection('blogs').doc();
      const slug = generateSlug(blog.title);

      const docData = {
        title: blog.title,
        content: blog.content,
        category: blog.category || 'General',
        tags: blog.tags || [],
        author: blog.author || 'Anonymous',
        imageUrl: blog.imageUrl || '',
        summary: blog.summary || '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        slug,
        views: 0,
      };

      batch.set(docRef, docData);
      count++;

      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed ${count} blogs`);
        batch = db.batch();
      }
    }

    if (count % 500 !== 0) {
      await batch.commit();
      console.log(`Committed remaining ${count % 500} blogs`);
    }

    console.log('All blogs uploaded successfully!');
  } catch (error) {
    console.error('Error uploading blogs:', error);
    throw error;
  }
}

uploadBlogs().catch((error) => {
  console.error('Upload failed:', error);
  process.exit(1);
});