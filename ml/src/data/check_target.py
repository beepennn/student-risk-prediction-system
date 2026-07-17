import pandas as pd


df = pd.read_csv(
    "data/raw/student_performance.csv"
)


print("Final Grade Statistics:")
print(df["FinalGrade"].describe())


print("\nMinimum Final Grade:")
print(df["FinalGrade"].min())


print("\nGrades Below 60:")
print(
    df[df["FinalGrade"] < 60]["FinalGrade"].count()
)


print("\nLowest Grades:")
print(
    df["FinalGrade"].sort_values().head(20)
)