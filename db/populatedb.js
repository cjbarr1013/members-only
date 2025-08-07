const { Client } = require('pg');
const { argv } = require('node:process');

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first VARCHAR(50),
  last VARCHAR(50),
  username VARCHAR(50),
  password VARCHAR(100),
  admin BOOLEAN DEFAULT FALSE,
  pic_url VARCHAR(2048),
  bio VARCHAR(250),
  loc VARCHAR(50),
  birthday DATE,
  added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(250),
  message TEXT,
  added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  message VARCHAR(2000),
  added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (first, last, username, password, admin, pic_url, bio, loc, birthday)
VALUES
  ('James', 'Carter', 'jcarter1345', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1722322426803-101270837197?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Coffee enthusiast and part-time philosopher. Always ready for a good debate about anything.', 'Portland', '2001-04-14'),
  ('Sarah', 'Mitchell', 'sarahm_admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Community manager by day, gamer by night. Trying to keep this place civil while having fun.', 'San Francisco', '1987-09-12'),
  ('Tiffany', 'Rose', 'tiffrose22', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Art student, glitter lover, and firm believer that life needs more sparkles', 'Los Angeles', '1998-03-22'),
  ('Chad', 'Brooks', 'chadfit', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1580518324671-c2f0833a3af3?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Personal trainer and nutrition coach. Always happy to share workout tips!', 'Austin', '1995-07-04'),
  ('Karen', 'Williams', 'kwilliams75', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1611432579699-484f7990b127?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '', 'Phoenix', '1975-11-15'),
  ('Luna', 'Hayes', 'lunahealer', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, '', 'Yoga instructor and crystal collector. Love connecting with like-minded souls on this journey called life.', 'Boulder', '1987-06-21'),
  ('Tyler', 'Rodriguez', 'tylerx03', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1584999734482-0361aecad844?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'College student, extreme sports enthusiast', 'Denver', '2003-12-12'),
  ('Deborah', 'Chen', 'debchen82', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Realist with a dry sense of humor. Work in accounting, which explains everything.', 'Seattle', '1982-02-25'),
  ('Alex', 'Thompson', 'alexthompson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1669475535925-a011d7c31d45?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Aspiring influencer and social media manager. Still figuring out this whole ''adult'' thing but having fun with it.', 'Miami', '1999-08-08'),
  ('Patricia', 'Davis', 'patdavis65', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, '', 'Retired teacher, community volunteer, and proud grandmother of three. Love organizing neighborhood events and keeping traditions alive.', 'Richmond', '1965-04-01'),
  ('Marcus', 'Johnson', 'marcusj73', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Music lover stuck in the wrong decade. Vinyl collector and weekend musician.', 'Nashville', '1973-09-16'),
  ('Blake', 'Anderson', 'blakeanderson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '', '', NULL),
  ('Brittany', 'Lee', 'brittlee97', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1581992652564-44c42f5ad3ad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Teacher, dog mom, and yes I love pumpkin spice. Don''t @ me.', 'Boston', '1997-10-31'),
  ('Hunter', 'Wilson', 'hunterwilson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Outdoor enthusiast and fishing guide. Love sharing stories from the trail and water.', 'Anchorage', '1989-01-20'),
  ('Crystal', 'Garcia', 'crystalg92', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Nurse and mom of two. My parents had a sense of humor with my name choice.', 'Houston', '1992-07-07'),
  ('Todd', 'Brown', 'toddbrown88', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false, '', 'Just your average guy living an average life in an average town.', 'Columbus', NULL);

INSERT INTO posts (title, message, user_id)
VALUES
  ('URGENT: Weird mole situation - girlfriend ultimatum!!!', 'Weird mole on my elbow getting bigger and smells. Girlfriend says it''s her or the mole!', 1),
  ('Hello everyone! 👋', 'Just joined this community and excited to meet everyone. Hope to make some good connections!', 2),
  ('Where can I find REAL pizza in this city??', 'Looking for authentic pizza places downtown. I''ve tried the chains but want something with character. Any local spots you''d recommend? Bonus points for good vegetarian options.', 3),
  ('Struggling to stay consistent with workouts...', 'How do you stay consistent with exercise? Struggling lately.', 4),
  ('Upstairs neighbor from hell - what are my options?', 'My upstairs neighbor plays loud music every night from 10 PM to 2 AM. I work early mornings and it''s affecting my sleep. I''ve talked to them twice but nothing changed. Don''t want to call the landlord yet but running out of patience. Anyone dealt with this?', 5),
  ('Crystal cleansing', 'Best way to cleanse rose quartz?', 6),
  ('Day 5 of trying to quit energy drinks and I''m dying', 'I''m drinking 3-4 energy drinks daily and can''t stop. Started in college but now it''s affecting my work and relationships. Tried going cold turkey but withdrawal was terrible. Any tips for tapering off gradually?', 7),
  ('Remote workers of Portland - coffee shop recommendations?', 'New to Portland, need good spots for remote work.', 12),
  ('Help! Inherited 2000+ vinyl records and completely overwhelmed', 'Uncle left me 2000+ records from 60s-2000s. I''m a digital music person but want to honor this collection. Some look valuable (Beatles, Blue Note jazz) but don''t know where to start. Should I get them appraised? Currently stored in milk crates in garage which seems wrong.', 11),
  ('What''s everyone doing for fall activities this year?', 'What are your favorite autumn activities? Looking for weekend plans.', 13),
  ('🎣 Personal best! Had to share with my fishing fam', 'Finally landed a monster this weekend. Had to share with fellow anglers!', 14),
  ('8 months unemployed and I''m starting to lose hope...', 'Applied to 200+ jobs, had 15 interviews, made it to final rounds twice but got rejected. Marketing field seems oversaturated. Every posting gets hundreds of applications. I''ve updated my resume three times, taken courses, worked with a career counselor. Constant rejection is destroying my self-worth. Savings almost gone, might have to move back with parents. How do you stay motivated? Starting to think I should abandon my field entirely.', 5),
  ('Ugh. Monday. Again.', 'Mondays getting worse. Even coffee doesn''t help anymore.', 8),
  ('Anyone else have embarrassing name stories?', 'Parents gave me a difficult name. Job interviews are always interesting.', 15),
  ('Does anyone else feel completely invisible lately?', 'Sometimes feel completely forgettable. Anyone else?', 16),
  ('Social media algorithms are DESTROYING small creators!!!', 'Creating content for 2 years but platforms keep changing algorithms. Three months ago getting 500-1000 views per post, good engagement. Now last five posts got maybe 50 views each. So disheartening putting effort into content that disappears. Tried different posting times, hashtags, engaging with others. Algorithm favors huge accounts making growth impossible for small creators.', 9),
  ('My GPS thinks I''m a fish apparently', 'GPS tried routing me to a lake yesterday. Technology is confusing.', 11),
  ('Protein question from a newbie', 'New to fitness, confused about daily protein needs.', 4),
  ('Self-improvement: where to even start when you''re a mess?', 'Want to change my life but don''t know where to begin. So many areas need work: health, career, relationships, finances, mental health. Every self-help article makes me more overwhelmed with different advice. Part of me wants to tackle everything at once, other part gets paralyzed. Stuck in cycles of motivation, burnout, feeling worse.', 8),
  ('SOS: Why do all my plants hate me?', 'Plants keep dying. Any tips for a black thumb?', 6),
  ('Fall depression is hitting different this year', 'Fall always makes me sad but this year feels worse. Maybe it''s another winter approaching after everything happening in the world, or just getting older and aware of time passing. Shorter days getting to me and it''s only October. Tried light therapy, vitamin D, exercise but still feeling heavy sadness and exhaustion.', 13),
  ('Epic cooking fail - need moral support', 'Recipe was a complete failure. Anyone else?', 3),
  ('I hate mirrors right now', 'Hate looking in mirrors lately. Anyone relate?', 15),
  ('Starbucks baristas definitely do this on purpose', 'Coffee shop spelled my name wrong again. Think they do it on purpose.', 12),
  ('HOW is anyone affording to live in 2024??', 'Make decent salary but still living paycheck to paycheck. Rent takes 40% of income, everything else expensive. Student loans, car payment, insurance, groceries, utilities leave barely anything. Budgeting apps just depress me seeing how little discretionary income I have. Any emergency wipes out savings. See people my age buying houses, taking vacations - how do they afford it?', 9),
  ('Do fish get depressed? Asking for a friend (my fish)', 'My fish acting strange. Do fish get depressed?', 14),
  ('Is Mercury in retrograde or am I just losing it?', 'Feeling off lately, crystals not helping. Maybe mercury in retrograde?', 6),
  ('What are the actual posting rules here??', 'What are the actual rules here? Want to follow guidelines properly.', 10),
  ('Why do I keep doing this to myself?', 'Drank too much coffee, now crashing hard. Why do I do this?', 7),
  ('Small victory! Actually did laundry AND folded it!', 'Managed to do laundry AND fold it same day! Sounds ridiculous but huge accomplishment for me. Been struggling with depression, basic tasks feel overwhelming. Usually clothes sit in basket for days or weeks. Yesterday folded everything immediately. Might seem like nothing but represents getting tiny bit of life together. Trying to celebrate small victories instead of focusing on what I''m not doing well.', 16);

INSERT INTO comments (message, post_id, user_id)
VALUES
  ('See a doctor!', 1, 2),
  ('Yikes', 1, 5),
  ('Go to urgent care immediately. That doesn''t sound normal and could be infected.', 1, 3),
  ('Try antiseptic first?', 1, 11),
  ('Infected', 1, 16),
  ('Welcome! Great community', 2, 13),
  ('Nice to meet you!', 2, 7),
  ('Hope you enjoy it here', 2, 12),
  ('Happy to see new faces around here. Feel free to jump into any conversation!', 2, 8),
  ('Tony''s Pizza on 5th Street is amazing! Been there 30 years, owner makes dough fresh daily. Get margherita with extra basil.', 3, 4),
  ('Try downtown near theater', 3, 9),
  ('Just order delivery', 3, 2),
  ('Mario''s has great crust and solid vegetarian options. Eggplant parm pizza surprisingly good, really fresh mozzarella.', 3, 15),
  ('Find workout buddy', 4, 7),
  ('Set small daily goals instead of everything at once. Even 15 minutes better than nothing.', 4, 1),
  ('Music helps me stay motivated', 4, 3),
  ('Try switching up routine', 4, 14),
  ('Talk to landlord? They might mediate or document complaints. Most leases have quiet hours clauses.', 5, 6),
  ('Call non-emergency police line', 5, 13),
  ('Noise complaints work', 5, 8),
  ('Document everything with timestamps and record noise levels if possible. I went through similar situation and evidence really helped when I had to involve landlord. Check local noise ordinances too.', 5, 12),
  ('Moonlight and running water work best', 6, 7),
  ('Sage smoke', 6, 1),
  ('Full moon cleansing traditional but any time works if intention clear. Hold under running water while visualizing negative energy washing away, leave in moonlight overnight.', 6, 3),
  ('Salt water overnight', 6, 5),
  ('Cut back gradually? Cold turkey with that much caffeine will make you feel terrible. Try replacing one drink daily with green tea.', 7, 4),
  ('Switch to coffee', 7, 11),
  ('Been there, gets better', 7, 12),
  ('Drink more water for jitters and headaches. Caffeine withdrawal is rough but body adjusts. Talk to doctor about tapering strategies.', 7, 9),
  ('Stumptown Coffee must visit', 8, 13),
  ('Blue Bottle great WiFi', 8, 6),
  ('Local roasters usually best', 8, 2),
  ('Avoid tourist spots downtown. Try Alberta or Hawthorne neighborhoods for really good local places. Coava and Heart both excellent with good work spaces.', 8, 15),
  ('Check vinyl condition first - scratches, warping, label condition. Research pressing info because some way more valuable.', 9, 16),
  ('Start with genres you like', 9, 5),
  ('Estate sales have finds', 9, 14),
  ('Incredible inheritance! Get valuable ones appraised, especially Blue Note, Prestige, original Beatles pressings. For storage, get proper sleeves and store vertically in cool, dry place. Never stack flat! Discogs good for checking values. Take your time, might have real treasures.', 9, 3),
  ('Apple picking fun', 10, 7),
  ('Hiking with fall colors', 10, 8),
  ('Pumpkin patches!', 10, 1),
  ('Football season starts', 10, 12),
  ('Nice catch! What bait?', 11, 3),
  ('Jealous! Haven''t fished in months', 11, 2),
  ('Great feeling', 11, 6),
  ('Where were you fishing? Looking for good bass spots in area.', 11, 9),
  ('Job market brutal right now. Been in similar situation and it''s soul-crushing. Try reaching out to recruiters - they have access to positions not posted publicly. LinkedIn networking surprisingly effective if done right.', 12, 8),
  ('Keep applying, something will come up', 12, 1),
  ('Try networking events?', 12, 15),
  ('Update resume regularly and tailor for each application. Time-consuming but generic applications rarely noticed. Consider temp work to get foot in door.', 12, 11),
  ('Monday energy real', 13, 5),
  ('Try different coffee', 13, 3),
  ('Weekend goes by too fast', 13, 16),
  ('At least not Sunday night', 13, 12),
  ('Parents can be creative', 14, 7),
  ('Own it! Unique names memorable and conversation starters in interviews. Friend with unusual name makes light joke about it and breaks ice really well.', 14, 4),
  ('Could be worse', 14, 1),
  ('Considered nickname?', 14, 13),
  ('Probably more memorable than you think', 15, 9),
  ('We all feel that way sometimes', 15, 8),
  ('Focus on people who do notice you', 15, 6),
  ('Quality over quantity in relationships. Better to have a few people who really see and appreciate you than to be superficially known by many. Also, being forgettable can actually be a superpower in some situations!', 15, 2),
  ('The algorithm changes are definitely hurting smaller creators. I''ve noticed the same thing with my content - it''s like they want you to pay for promotion now to get any visibility at all. Have you tried diversifying to other platforms? TikTok and YouTube Shorts seem to be giving smaller creators more opportunities right now.', 16, 13),
  ('Engagement is down for everyone', 16, 5),
  ('Try posting at different times', 16, 3),
  ('Content consistency helps but honestly the algorithm seems designed to favor accounts that already have huge followings. It''s frustrating because it creates this impossible barrier for new creators. Maybe focus on building a smaller, more engaged community rather than chasing big numbers?', 16, 14),
  ('Have you tried restarting it?', 17, 12),
  ('GPS updates might help', 17, 11),
  ('Technology definitely has its moments', 17, 7),
  ('Maybe time for a new phone if it''s acting up that much. Sometimes the GPS issues are hardware related.', 17, 15),
  ('Start with 0.8g per pound of body weight', 18, 1),
  ('Chicken, fish, and beans are good sources', 18, 9),
  ('Don''t overthink it too much', 18, 2),
  ('Protein powder makes it easier but whole foods are generally better. Focus on getting protein at every meal rather than trying to hit some perfect number. Your body can only process so much at once anyway.', 18, 6),
  ('Start with one small habit and build from there. I know it sounds cliche but trying to change everything at once is a recipe for burnout. Pick the area that would have the biggest positive impact on other areas of your life and focus there first.', 19, 3),
  ('Atomic Habits is a great book', 19, 13),
  ('Therapy can be really helpful for figuring out priorities and creating sustainable change. Sometimes we need an outside perspective to see our blind spots.', 19, 10),
  ('Just taking the first step matters', 19, 16),
  ('Try different soil and watering schedules', 20, 8),
  ('Some plants are just finicky', 20, 4),
  ('Start with easy plants like pothos or snake plants - they''re basically impossible to kill and will give you confidence. Also, most people over-water rather than under-water. Check the soil with your finger before watering.', 20, 5),
  ('YouTube has great gardening tutorials', 20, 11),
  ('Light therapy really does help if you can afford one of those SAD lamps. I was skeptical but it made a noticeable difference for me. Also, vitamin D supplements and trying to get outside even when it''s cloudy can help.', 21, 12),
  ('Vitamin D supplements', 21, 7),
  ('Exercise really makes a difference even when you don''t feel like it. Even just a 10-minute walk can shift your mood.', 21, 1),
  ('You''re definitely not alone in feeling this way. Seasonal depression is so real and it seems to hit harder some years than others. Be gentle with yourself and remember it''s temporary even though it doesn''t feel like it in the moment.', 21, 3),
  ('What were you trying to make?', 22, 9),
  ('Kitchen disasters make the best stories later! I once set off the smoke alarm making scrambled eggs. We all start somewhere.', 22, 14),
  ('Practice makes perfect', 22, 2),
  ('At least you tried something new - that''s more than a lot of people do. Cooking is all about experimenting and learning from mistakes. What went wrong exactly? Maybe we can help troubleshoot for next time.', 22, 15);
`;

async function main() {
  console.log('seeding...');
  const client = new Client({
    connectionString: argv[2],
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log('done');
}

main();
