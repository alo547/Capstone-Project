require('dotenv').config();
const { Pool } = require('pg');

const port = 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS comments;
            DROP TABLE IF EXISTS reviews;
            DROP TABLE IF EXISTS books;
            DROP TABLE IF EXISTS users;`)

        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );

     CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) UNIQUE NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        description TEXT,
        average_rating DECIMAL(2,1) DEFAULT 0

);

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        book_id INT REFERENCES books(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        review_id INT REFERENCES reviews(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        comment_text TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (review_id, user_id)
);
    `);
        console.log(" Tables created successfully!");
    } catch (error) {
        console.error(" Error creating tables:", error);
    }
};

const seedDatabase = async () => {
    try {
        await pool.query(`
        INSERT INTO users (username, email, password_hash) VALUES
        ('booklover99', 'booklover99@example.com', 'hashedpassword1'),
        ('avidreader', 'avidreader@example.com', 'hashedpassword2'),
        ('literarycritic', 'literarycritic@example.com', 'hashedpassword3'),
        ('page_turner', 'pageturner@example.com', 'hashedpassword4'),
        ('fictionfan', 'fictionfan@example.com', 'hashedpassword5');

       INSERT INTO books (title, author, genre, description, average_rating) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic',
 'A novel about wealth and love in the 1920s, capturing the decadence and disillusionment of the American Dream. Often cited as one of the greatest American novels, it critiques the moral decay behind opulence.

 Awards Won: None upon release, but later recognized as one of the greatest American novels.

 Notable Quote: "So we beat on, boats against the current, borne back ceaselessly into the past."', 4.2),

('To Kill a Mockingbird', 'Harper Lee', 'Classic',
 'A powerful story of racial injustice and moral growth in the segregated American South. The book became a touchstone in American literature for its exploration of conscience, empathy, and equality.

 Awards Won: Pulitzer Prize for Fiction (1961).

 Notable Quote: "You never really understand a person until you consider things from his point of view... until you climb inside of his skin and walk around in it."', 4.8),

('1984', 'George Orwell', 'Dystopian',
 'A chilling portrayal of a totalitarian regime and the fight for truth and freedom. Orwell’s vision shaped global discourse on surveillance, censorship, and authoritarianism.

 Awards Won: Prometheus Hall of Fame Award.

 Notable Quote: "Big Brother is watching you."', 4.6),

('The Hobbit', 'J.R.R. Tolkien', 'Fantasy',
 'An epic fantasy adventure following Bilbo Baggins as he steps into a world of dragons, treasure, and heroism. It laid the groundwork for modern fantasy literature and introduced Middle-earth to the world.

 Awards Won: Retro-Hugo Award for Best Novel (1969).

 Notable Quote: "In a hole in the ground there lived a hobbit."', 4.7),

('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy',
 'A young wizard discovers his magical heritage, kicking off a series that redefined children’s literature and ignited a global cultural phenomenon.

 Awards Won: Nestlé Smarties Book Prize, British Book Awards.

 Notable Quote: "It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends."', 4.9),

('The Catcher in the Rye', 'J.D. Salinger', 'Classic',
 'A rebellious teenager’s introspective journey through alienation and identity. The novel resonated deeply with post-war youth and remains a symbol of adolescent angst.

 Awards Won: None officially, but remains highly influential in American literature.

 Notable Quote: "I’m the most terrific liar you ever saw in your life. It’s awful. If I’m on my way to the store to buy a magazine and somebody asks me where I’m going, I’m liable to say I’m going to the opera."', 4.1),

('Pride and Prejudice', 'Jane Austen', 'Romance',
 'A romantic and satirical exploration of love, class, and societal expectations in 19th-century England. Its wit and social critique continue to inspire readers and adaptations globally.

 Awards Won: None upon release, but has inspired countless adaptations and remains a beloved classic.

 Notable Quote: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."', 4.5),

('The Martian', 'Andy Weir', 'Science Fiction',
 'An astronaut stranded on Mars uses science and ingenuity to survive. The novel’s blend of humor, realism, and scientific accuracy rekindled mainstream interest in space exploration.

 Awards Won: Hugo Award for Best Novelette (2014).

 Notable Quote: "I’m going to have to science the s**t out of this."', 4.8),

('Dune', 'Frank Herbert', 'Science Fiction',
 'A richly layered saga of power, ecology, and destiny on a desert planet. Dune influenced generations of science fiction writers and thinkers, particularly in its environmental themes.

 Awards Won: Hugo Award for Best Novel (1966), Nebula Award for Best Novel (1965).

 Notable Quote: "Fear is the mind-killer. Fear is the little-death that brings total obliteration."', 4.6),

('The Alchemist', 'Paulo Coelho', 'Philosophical',
 'A shepherd embarks on a spiritual quest to fulfill his personal legend. The novel’s message of self-discovery and purpose resonated globally, making it a modern classic of inspirational literature.

 Awards Won: Crystal Award from the World Economic Forum (1999).

 Notable Quote: "When you want something, all the universe conspires in helping you to achieve it."', 4.3),

('Brave New World', 'Aldous Huxley', 'Dystopian',
 'A futuristic society driven by control, consumerism, and genetic manipulation. Huxley’s vision is frequently revisited in debates around technology, freedom, and individualism.

 Awards Won: None officially, but it remains a seminal work in dystopian literature.

 Notable Quote: "Community, Identity, Stability."', 4.4),

('The Road', 'Cormac McCarthy', 'Post-Apocalyptic',
 'A bleak, poetic journey of a father and son through a destroyed world. The novel’s themes of survival, love, and desolation left a lasting mark on post-apocalyptic fiction.

 Awards Won: Pulitzer Prize for Fiction (2007).

 Notable Quote: "You forget what you want to remember, and you remember what you want to forget."', 4.2),

('Little Women', 'Louisa May Alcott', 'Classic',
 'Four sisters grow up during the Civil War, navigating love, loss, and independence. It broke ground in portraying complex female characters and has remained a feminist touchstone.

 Awards Won: None officially, but has been adapted multiple times for film and television.

 Notable Quote: "I am not afraid of storms, for I am learning how to sail my ship."', 4.3),

('Circe', 'Madeline Miller', 'Mythology',
 'A reimagining of the life of Circe, the powerful sorceress from Greek mythology. The novel reshaped myth through a feminist lens, exploring identity and empowerment.

 Awards Won: Goodreads Choice Award for Fantasy (2018).

 Notable Quote: "I was not a man, and I was not a god. I was something in between."', 4.5),

('The Silent Patient', 'Alex Michaelides', 'Thriller',
 'A renowned artist stops speaking after a violent crime, leading to a gripping psychological unraveling. Its twist ending captivated modern thriller fans and sparked widespread discussions.

 Awards Won: None officially, but became an instant bestseller.

 Notable Quote: "If you look at the world, there are only two kinds of people: those who want to be loved, and those who want to be left alone."', 4.1),

('Where the Crawdads Sing', 'Delia Owens', 'Mystery',
 'A reclusive girl’s life in the marsh intertwines with a mysterious murder case. The novel became a cultural phenomenon for its lyrical writing and themes of nature, isolation, and resilience.

 Awards Won: Reese Witherspoon Book Club pick, Best Fiction (2018).

 Notable Quote: "The marsh was not a place of escape, it was a place of refuge."', 4.6),

('Educated', 'Tara Westover', 'Memoir',
 'A woman breaks away from her survivalist family to pursue education, transforming her worldview. The memoir sparked conversations on education, identity, and family loyalty.

 Awards Won: Goodreads Choice Award for Memoir & Autobiography (2018).

 Notable Quote: "You can love someone and still choose to say goodbye."', 4.7),

('The Night Circus', 'Erin Morgenstern', 'Fantasy',
 'Two illusionists battle within a magical, mysterious circus that only appears at night. Its dreamlike narrative style and romanticism enchanted readers and pushed the boundaries of fantasy storytelling.

 Awards Won: Locus Award for Best First Novel (2012).

 Notable Quote: "The circus arrives without warning."', 4.4),

('A Man Called Ove', 'Fredrik Backman', 'Contemporary Fiction',
 'A grumpy old man finds new meaning in life through unexpected friendships. The novel touched readers globally with its humor and warmth, inspiring empathy across generations.

 Awards Won: Goodreads Choice Award for Fiction (2014).

 Notable Quote: "It’s not the right time for this," Ove says. "When is the right time?" asks Parvaneh. "When it’s too late."', 4.5),

('Project Hail Mary', 'Andy Weir', 'Science Fiction',
 'A lone astronaut wakes up with no memory and a mission to save humanity. The book’s inventive science and emotional depth further solidified Weir’s influence in modern sci-fi.

 Awards Won: None officially, but became a bestseller.

 Notable Quote: "I’m just a simple guy trying to survive."', 4.8),

('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy',
 'The lyrical tale of Kvothe, a legendary wizard recounting his mysterious past. It elevated fantasy literature with its depth of world-building and poetic storytelling.

 Awards Won: Quill Award for Best Science Fiction/Fantasy/Horror (2007).

 Notable Quote: "It’s not the world that’s cruel, it’s the people in it."', 4.7),

('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Historical Fiction',
 'A Hollywood legend reveals her hidden past and personal sacrifices. The novel delves into fame, identity, and LGBTQ+ representation, earning acclaim for its emotional nuance.

 Awards Won: Goodreads Choice Award for Historical Fiction (2017).

 Notable Quote: "I am Evelyn Hugo, and I am not interested in being remembered."', 4.6),

('The Midnight Library', 'Matt Haig', 'Philosophical Fiction',
 'A woman navigates alternate lives through a mystical library, confronting regrets and possibilities. It struck a chord for its exploration of mental health and existential reflection.

 Awards Won: None officially, but received widespread acclaim for its themes.

 Notable Quote: "The only way to learn is to live."', 4.4),

('The Book Thief', 'Markus Zusak', 'Historical Fiction',
 'Set in Nazi Germany, a young girl finds hope and resistance through stolen books. Narrated by Death, it offered a unique, haunting view of war and the power of stories.

 Awards Won: Michael L. Printz Honor, Book Sense Book of the Year Award.

 Notable Quote: "I have hated words and I have loved them, and I hope I have made them right."', 4.6);
        INSERT INTO reviews (book_id, user_id, rating, review_text, created_at) VALUES
        (1, 1, 5, 'A timeless masterpiece with incredible storytelling.', NOW()),
        (1, 2, 4, 'Loved the themes but found the pacing slow.', NOW()),
        (2, 3, 5, 'A powerful book that everyone should read.', NOW()),
        (3, 4, 4, 'A chilling vision of the future, very thought-provoking.', NOW()),
        (4, 5, 5, 'Absolutely loved the adventure and world-building.', NOW()),
        (5, 1, 5, 'An amazing start to the Harry Potter series!', NOW()),
        (6, 2, 3, 'Didn’t connect with the protagonist but well-written.', NOW()),
        (7, 3, 5, 'A beautiful romance with witty dialogue.', NOW()),
        (8, 4, 4, 'Very entertaining and scientifically accurate.', NOW()),
        (9, 5, 5, 'A sci-fi epic that’s a must-read for fans of the genre.', NOW());


        INSERT INTO comments (review_id, user_id, comment_text, created_at) VALUES
        (1, 2, 'I completely agree! This book is a classic.', NOW()),
        (1, 3, 'I felt the same way, but I wished the ending was different.', NOW()),
        (2, 4, 'That’s interesting! I personally loved the pacing.', NOW()),
        (3, 5, 'Yes! This book really makes you think about society.', NOW()),
        (4, 1, 'Orwell was ahead of his time.', NOW()),
        (5, 2, 'Tolkien’s world-building is unmatched.', NOW()),
        (6, 3, 'I think the later books in the series get even better.', NOW()),
        (7, 4, 'Pride and Prejudice is one of my all-time favorites.', NOW()),
        (8, 5, 'The science in The Martian was so well-researched.', NOW()),
        (9, 1, 'Dune is one of the best sci-fi novels ever written.', NOW());

      `);
        console.log(" Database seeded successfully!");
    } catch (error) {
        console.error(" Error seeding database:", error);
    }
};

module.exports = { pool, createTables, seedDatabase };
