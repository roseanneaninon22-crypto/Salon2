-- Seed all service items from the app catalog.
-- Run AFTER service_items.sql. Safe to re-run (truncates first).

truncate table public.service_items restart identity cascade;

insert into public.service_items (category, service, name, duration, price) values

-- ── Hair Cut (Women's) ──────────────────────────────────────────────────
('Hair', 'Hair Cut', 'Long Layers',        '45–60 min', 450),
('Hair', 'Hair Cut', 'Short Layers',       '45–60 min', 420),
('Hair', 'Hair Cut', 'Bob Cut',            '45 min',    400),
('Hair', 'Hair Cut', 'Lob (Long Bob)',     '45–60 min', 450),
('Hair', 'Hair Cut', 'Pixie Cut',          '45 min',    380),
('Hair', 'Hair Cut', 'Wolf Cut',           '60 min',    550),
('Hair', 'Hair Cut', 'Butterfly Cut',      '60 min',    550),
('Hair', 'Hair Cut', 'Shag Cut',           '45–60 min', 480),
('Hair', 'Hair Cut', 'Blunt Cut',          '45 min',    400),
('Hair', 'Hair Cut', 'U-Cut',              '45 min',    380),
('Hair', 'Hair Cut', 'V-Cut',              '45 min',    380),
('Hair', 'Hair Cut', 'Face-Framing Cut',   '45–60 min', 420),
('Hair', 'Hair Cut', 'Curtain Bangs',      '30–45 min', 250),
('Hair', 'Hair Cut', 'Side-Swept Bangs',   '30–45 min', 250),
('Hair', 'Hair Cut', 'Wispy Bangs',        '30–45 min', 250),

-- ── Hair Cut (Men's) ────────────────────────────────────────────────────
('Hair', 'Hair Cut', 'Classic Cut',        '30 min',    300),
('Hair', 'Hair Cut', 'Buzz Cut',           '20–30 min', 250),
('Hair', 'Hair Cut', 'Crew Cut',           '30 min',    280),
('Hair', 'Hair Cut', 'Fade Cut',           '30–45 min', 320),
('Hair', 'Hair Cut', 'Low Fade',           '30–45 min', 330),
('Hair', 'Hair Cut', 'Mid Fade',           '30–45 min', 330),
('Hair', 'Hair Cut', 'High Fade',          '30–45 min', 340),
('Hair', 'Hair Cut', 'Taper Fade',         '30–45 min', 320),
('Hair', 'Hair Cut', 'Undercut',           '30–45 min', 350),
('Hair', 'Hair Cut', 'French Crop',        '30–45 min', 320),
('Hair', 'Hair Cut', 'Caesar Cut',         '30 min',    280),
('Hair', 'Hair Cut', 'Two-Block Cut',      '45 min',    380),
('Hair', 'Hair Cut', 'Comma Haircut',      '30–45 min', 350),
('Hair', 'Hair Cut', 'Textured Crop',      '30–45 min', 330),
('Hair', 'Hair Cut', 'Pompadour',          '30–45 min', 350),
('Hair', 'Hair Cut', 'Quiff',              '30–45 min', 350),
('Hair', 'Hair Cut', 'Side Part',          '30–45 min', 320),
('Hair', 'Hair Cut', 'Slick Back',         '30–45 min', 340),
('Hair', 'Hair Cut', 'Mullet',             '45 min',    380),
('Hair', 'Hair Cut', 'Curtain Haircut',    '45 min',    380),

-- ── Hair Cut (Kids') ────────────────────────────────────────────────────
('Hair', 'Hair Cut', 'Kids Bob Cut',       '30–45 min', 250),
('Hair', 'Hair Cut', 'Kids Layered Cut',   '30–45 min', 260),
('Hair', 'Hair Cut', 'Kids Pixie Cut',     '30 min',    220),
('Hair', 'Hair Cut', 'Classic Short Cut',  '30 min',    220),
('Hair', 'Hair Cut', 'Kids Fade',          '20–30 min', 200),
('Hair', 'Hair Cut', 'Kids Crew Cut',      '20–30 min', 200),
('Hair', 'Hair Cut', 'Kids Undercut',      '30 min',    240),
('Hair', 'Hair Cut', 'Kids Mullet',        '30–45 min', 260),

-- ── Hair Spa ────────────────────────────────────────────────────────────
('Hair', 'Hair Spa', 'Basic Hair Spa',           '45 min',  480),
('Hair', 'Hair Spa', 'Keratin Hair Spa',         '90 min',  1200),
('Hair', 'Hair Spa', 'Deep Conditioning Spa',    '60 min',  650),
('Hair', 'Hair Spa', 'Scalp Detox Spa',          '60 min',  700),
('Hair', 'Hair Spa', 'Anti-Dandruff Hair Spa',   '60 min',  620),
('Hair', 'Hair Spa', 'Hair Fall Control Spa',    '75 min',  850),
('Hair', 'Hair Spa', 'Dry & Damaged Hair Spa',   '75 min',  800),
('Hair', 'Hair Spa', 'Oil Therapy Hair Spa',     '60 min',  600),
('Hair', 'Hair Spa', 'Color Protection Spa',     '60 min',  750),
('Hair', 'Hair Spa', 'Protein Hair Spa',         '90 min',  950),
('Hair', 'Hair Spa', 'Scalp Massage Spa',        '45 min',  520),
('Hair', 'Hair Spa', 'Anti-Frizz Hair Spa',      '60 min',  680),
('Hair', 'Hair Spa', 'Rebonded Hair Spa',        '90 min',  1000),
('Hair', 'Hair Spa', 'Hair Growth Care Spa',     '75 min',  880),
('Hair', 'Hair Spa', 'Luxury Hair Spa',          '120 min', 1500),

-- ── Hair Color ──────────────────────────────────────────────────────────
('Hair', 'Hair Color', 'Full Hair Color',      '90 min',  1200),
('Hair', 'Hair Color', 'Root Touch-Up',        '45 min',  650),
('Hair', 'Hair Color', 'Jet Black',            '75 min',  950),
('Hair', 'Hair Color', 'Dark Brown',           '90 min',  1100),
('Hair', 'Hair Color', 'Chocolate Brown',      '90 min',  1150),
('Hair', 'Hair Color', 'Light Brown',          '90 min',  1100),
('Hair', 'Hair Color', 'Honey Blonde',         '120 min', 1400),
('Hair', 'Hair Color', 'Ash Blonde',           '120 min', 1400),
('Hair', 'Hair Color', 'Platinum Blonde',      '150 min', 1700),
('Hair', 'Hair Color', 'Ash Brown',            '90 min',  1150),
('Hair', 'Hair Color', 'Burgundy',             '90 min',  1200),
('Hair', 'Hair Color', 'Mahogany',             '90 min',  1200),
('Hair', 'Hair Color', 'Wine Red',             '90 min',  1200),
('Hair', 'Hair Color', 'Copper',               '90 min',  1200),
('Hair', 'Hair Color', 'Silver Grey',          '150 min', 1700),
('Hair', 'Hair Color', 'Mocha Brown',          '90 min',  1150),
('Hair', 'Hair Color', 'Chestnut Brown',       '90 min',  1150),
('Hair', 'Hair Color', 'Black Hair Color',     '75 min',  950),
('Hair', 'Hair Color', 'Fashion Colors',       '120 min', 1800),
('Hair', 'Hair Color', 'Color Correction',     '150 min', 2500),

-- ── Nails — Manicure ────────────────────────────────────────────────────
('Nails', 'Manicure', 'Classic Manicure',    '40 min', 290),
('Nails', 'Manicure', 'Gel Manicure',        '60 min', 550),
('Nails', 'Manicure', 'Acrylic Nails',       '90 min', 850),
('Nails', 'Manicure', 'Nail Extension',      '90 min', 900),
('Nails', 'Manicure', 'Nail Art (per nail)', '15 min', 60),

-- ── Nails — Pedicure ────────────────────────────────────────────────────
('Nails', 'Pedicure', 'Classic Pedicure', '45 min', 350),
('Nails', 'Pedicure', 'Gel Pedicure',     '60 min', 600),
('Nails', 'Pedicure', 'Spa Pedicure',     '75 min', 750),
('Nails', 'Pedicure', 'Foot Spa & Scrub', '60 min', 650),

-- ── Makeup ──────────────────────────────────────────────────────────────
('Makeup', 'Makeup', 'Natural Day Makeup',   '45 min',  700),
('Makeup', 'Makeup', 'Glam Evening Makeup',  '75 min',  1200),
('Makeup', 'Makeup', 'Bridal Makeup',        '120 min', 2500),
('Makeup', 'Makeup', 'Photoshoot Makeup',    '90 min',  1500),

-- ── Face — Facial ───────────────────────────────────────────────────────
('Face', 'Facial', 'Classic Facial',        '60 min', 550),
('Face', 'Facial', 'Hydrating Facial',      '60 min', 700),
('Face', 'Facial', 'Anti-Aging Facial',     '75 min', 950),
('Face', 'Facial', 'Acne Treatment Facial', '75 min', 850),
('Face', 'Facial', 'Diamond Peel',          '60 min', 1000),

-- ── Face — Eyebrow & Lashes ─────────────────────────────────────────────
('Face', 'Eyebrow & Lashes', 'Eyebrow Threading', '20 min', 150),
('Face', 'Eyebrow & Lashes', 'Eyebrow Shaping',   '30 min', 200),
('Face', 'Eyebrow & Lashes', 'Eyebrow Tint',      '30 min', 350),
('Face', 'Eyebrow & Lashes', 'Eyelash Extension', '90 min', 900),

-- ── Waxing ──────────────────────────────────────────────────────────────
('Waxing', 'Waxing', 'Underarm Wax',      '20 min', 250),
('Waxing', 'Waxing', 'Half Leg Wax',      '30 min', 400),
('Waxing', 'Waxing', 'Full Leg Wax',      '45 min', 650),
('Waxing', 'Waxing', 'Arm Wax',           '30 min', 350),
('Waxing', 'Waxing', 'Full Body Wax',     '90 min', 1800),
('Waxing', 'Waxing', 'Bikini Wax',        '30 min', 550),
('Waxing', 'Waxing', 'Chest & Back Wax',  '45 min', 800);
