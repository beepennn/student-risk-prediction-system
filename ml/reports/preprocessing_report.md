
# Preprocessing Report

## Dataset

Input file:

`data\raw\student_performance_new_with_gpa_semester.csv`

Output file:

`data\processed\student_performance_processed.csv`

## Dataset Shape

Original rows: 5000

Rows removed: 0

Final rows: 5000

Final columns: 8

## ML Features

The final backend-compatible ML features are:

- attendance
- internal_marks
- assignment_score
- quiz_score
- previous_gpa
- semester
- gender

## Target

Target variable:

`AcademicRisk`

## Academic Risk Distribution

AcademicRisk
Medium Risk    1708
High Risk      1704
Low Risk       1588

## Semester Distribution

semester
1    650
2    684
3    599
4    608
5    629
6    606
7    630
8    594

## Gender Distribution

gender
Male      2551
Female    2449

## Missing Values

attendance          0
internal_marks      0
assignment_score    0
quiz_score          0
previous_gpa        0
semester            0
gender              0
AcademicRisk        0

## Encoding

Gender and semester are kept as raw values.

Encoding is handled automatically by the sklearn Pipeline using OneHotEncoder.

The preprocessing script does not manually create:

- Gender_Male
- Semester_1
- Semester_2
- Semester_3
- etc.
