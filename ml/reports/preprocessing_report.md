# Preprocessing Report

## Input

`C:\Users\Asus\student-risk-prediction-system\ml\data\raw\student_performance_new_with_gpa_semester.csv`

## Output

`C:\Users\Asus\student-risk-prediction-system\ml\data\processed\student_performance_processed.csv`

## Rows

- Original rows: 5000
- Final rows: 5000
- Removed rows: 0

## Features

- attendance
- internal_marks
- assignment_score
- quiz_score
- previous_gpa
- semester
- gender

## Target Method

The target is generated from an interpretable weighted
academic performance score:

- Attendance: 25%
- Internal marks: 20%
- Assignment score: 15%
- Quiz score: 15%
- Previous GPA: 25%

Risk categories:

- Performance score below 50: High Risk
- Performance score from 50 to below 70: Medium Risk
- Performance score 70 or above: Low Risk

## Risk Distribution

AcademicRisk
Low Risk       3619
Medium Risk    1381

## Missing Values

attendance           0
internal_marks       0
assignment_score     0
quiz_score           0
previous_gpa         0
semester             0
gender               0
performance_score    0
AcademicRisk         0