# Student Performance Analytics System
### with Adaptive Retention Testing

A Python-based application that goes beyond storing marks — it measures
whether students actually **retain** what they learn, and automatically
decides **when** to retest each student based on how fast they forget.

Most academic performance systems answer *"what score did the student
get?"*. This one answers *"is the student actually remembering it, and
who needs to be retested — and when?"*

---

## Table of Contents

- [Why This Project Is Different](#why-this-project-is-different)
- [Core Concept: Test → Retest → Retention Score](#core-concept-test--retest--retention-score)
- [Headline Feature: Adaptive Retest Scheduler](#headline-feature-adaptive-retest-scheduler)
- [Other Features](#other-features)
- [Roles: Student vs Teacher](#roles-student-vs-teacher)
- [Tech Stack](#tech-stack)
- [Planned Database Schema](#planned-database-schema)
- [Project Structure](#project-structure)
- [How a Retention Score Is Calculated](#how-a-retention-score-is-calculated)
- [Sample Workflow](#sample-workflow)
- [Roadmap](#roadmap)
- [Team](#team)

---

## Why This Project Is Different

A typical "Student Performance Analytics" project stores marks, computes
an average, and shows a bar chart. That's the same project everyone
builds — it describes the past and stops there.

This project is built around one different question: **does a good
score today mean the student will still know it next week?** To answer
that, every topic is tested twice — once when it's taught, and again
later with different questions on the same topic — and the *drop*
between the two scores becomes the real signal, not the raw mark.

On top of that, the system doesn't just report the drop after the fact.
It uses each student's personal forgetting rate to **decide when to
retest them next**, automatically — so the teacher gets a to-do list
("retest these 4 students on Normalization next Tuesday") instead of a
static report card.

---

## Core Concept: Test → Retest → Retention Score

For every topic, in every subject:

1. **Initial Test** — a short weekly test on a topic, right after it's
   taught. The topic's study material (PDF) is attached so students
   know exactly what it was drawn from.
2. **Retest** — a follow-up test on the *same topic*, with *different
   questions*, given some time later.
3. **Retention Score** — how much of the initial score survived:

   ```
   retention_score = (retest_score / initial_test_score) × 100
   ```

A student who scores 90 → 85 has genuinely learned the topic. A student
who scores 90 → 40 crammed for the first test and forgot it. A normal
grading system treats both students identically. This one doesn't.

---

## Headline Feature: Adaptive Retest Scheduler

This is the novelty the faculty is looking for — the system doesn't
retest everyone on a fixed schedule. It reacts to each student
individually.

- After every retest, the system looks at how much that student's score
  dropped.
- **Small drop (retains well)** → the next retest on that topic is
  scheduled further out (e.g. in 3 weeks).
- **Large drop (forgets fast)** → the next retest is scheduled soon
  (e.g. in 3 days).

This is the same principle behind spaced-repetition tools like Anki —
applied to classroom topics instead of flashcards. No score-tracking
project acts on the data like this; most only display it after the
term is over. This one tells the teacher what to do *next*.

The scheduling rule itself is simple and explainable (not a black-box
model), which matters for a project review:

```
drop_percent = 100 - retention_score

if drop_percent <= 15:   next_retest_in_days = 21   # retains well
elif drop_percent <= 40: next_retest_in_days = 10   # average
else:                    next_retest_in_days = 3    # forgets fast
```

---

## Other Features

- **Topic-level tracking, not just subject-level** — every test is tied
  to a specific topic (e.g. "Normalization" inside DBMS), not just the
  subject as a whole. A report can say exactly *which* topic a student
  is weak in, not just their overall subject score.
- **Class-wide Forgetting Heatmap** — a grid of students × topics,
  colored by retention score, so a teacher can see at a glance where
  the *whole class* forgets fastest — not just individual reports.
- **Question-level tagging** — each question is tagged with the
  sub-concept it tests (e.g. "foreign keys," "joins," "normal forms")
  so a report can say *why* a student is losing marks, not just *how
  many*.
- **Auto-generated student reports (PDF)** — grade summary, retention
  trend chart, and a short "focus on these topics next" list, generated
  automatically per student.
- **Topic PDF attachments** — the study material behind each test is
  stored and made available to students directly from their dashboard.

---

## Roles: Student vs Teacher

| Role        | Can do                                                                 |
|-------------|--------------------------------------------------------------------------|
| **Teacher**  | Create subjects/topics, upload topic PDFs, create tests & retests, enter/import scores, view the class heatmap, view the adaptive retest schedule, export reports |
| **Student**   | View their own scores and retention trend, download topic PDFs, see their personal "weak topics" list, see when their next retest is due |

Login is role-based — a student only ever sees their own data; a
teacher sees the whole class.

---

## Tech Stack

- **Python 3** — core logic
- **SQLite** — persistent storage
- **Matplotlib** — retention trend charts and the class heatmap
- **Regular Expressions** — input validation
- **PDF handling** (e.g. `fpdf2` / `reportlab`) — attaching topic
  material and generating auto reports
- **Password hashing** (`hashlib` / `bcrypt`) — for basic login security

---

## Planned Database Schema

```
users            (user_id, name, email, password_hash, role)  -- role: student / teacher
students         (student_id → user_id, roll_no, class_name)

subjects         (subject_id, name)
topics           (topic_id, subject_id, title, pdf_path)

tests            (test_id, topic_id, test_type, linked_test_id, date)
                  -- test_type: INITIAL or RETEST
                  -- linked_test_id: for a RETEST, points back to its INITIAL test

questions        (question_id, test_id, concept_tag, max_marks)
attempts         (attempt_id, student_id, test_id, score, date)

retest_schedule  (student_id, topic_id, scheduled_date)
                  -- generated automatically after each retest
```

Retention score is **not stored** — it's calculated on the fly from a
student's paired `attempts` (INITIAL vs its linked RETEST). This keeps
the schema normalized instead of duplicating a value that can always be
derived.

---

## Project Structure

```
student_performance_analytics_system/
├── main.py                  # Entry point / menu (or app launcher)
├── auth.py                   # Login, roles, password hashing
├── database.py                 # SQLite connection & table setup
├── validators.py                 # Email/phone/input validation
├── subjects_topics.py               # Manage subjects, topics, PDF uploads
├── tests.py                            # Create tests/retests, record attempts
├── retention.py                          # Retention score + adaptive scheduler logic
├── analytics.py                             # Class averages, heatmap data, rankings
├── visualization.py                            # Charts: trend lines, heatmap
├── reports.py                                     # Auto-generated PDF reports
├── backup.py                                         # CSV/PDF export
├── requirements.txt
└── README.md
```

---

## How a Retention Score Is Calculated

```python
def retention_score(initial_score, initial_max, retest_score, retest_max):
    initial_pct = (initial_score / initial_max) * 100
    retest_pct = (retest_score / retest_max) * 100
    return round((retest_pct / initial_pct) * 100, 2) if initial_pct else 0
```

That score then feeds directly into the adaptive scheduler described
above to set the student's next retest date for that topic.

---

## Sample Workflow

```text
1. Teacher creates topic "Normalization" under DBMS, uploads topic PDF
2. Teacher creates Initial Test → students attempt it
3. System schedules a retest ~1 week later
4. Students attempt the Retest (different questions, same topic)
5. System calculates retention_score for each student
6. Adaptive scheduler sets each student's NEXT retest date individually
7. Teacher opens the Class Heatmap → sees Normalization is a weak spot
8. Student logs in → sees "Normalization: retention 62% → revise before
   your retest on [date]" + downloads the topic PDF
9. End of term → auto-generated PDF report per student
```

---

## Roadmap

- [ ] Role-based login (student/teacher)
- [ ] Subject → Topic → Test/Retest data model
- [ ] Retention score calculation
- [ ] Adaptive retest scheduler
- [ ] Class-wide forgetting heatmap
- [ ] Question-level concept tagging
- [ ] Auto-generated PDF reports
- [ ] Topic PDF upload/download
- [ ] (Stretch) Early-warning trend detection across weeks
- [ ] (Stretch) Item-level question calibration (flag outlier questions)

---

## Team

| Name                     | Roll Number         |
|----------------------------|------------------------|
| Prakhar                      | CB.SC.U4AIE24366        |
| Solleti Venkata Dhiraj          | CB.SC.U4AIE24052        |
| Sane Sandeep                       | CB.SC.U4AIE24047        |

B.Tech Computer Science (AI Specialization), Amrita Vishwa Vidyapeetham
