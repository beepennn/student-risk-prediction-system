from __future__ import annotations

from typing import TypedDict


class CurriculumSubject(TypedDict):
    code: str
    name: str
    credits: float
    standard_assessment: bool


COMPUTER_ENGINEERING = "Computer Engineering"

BEI = (
    "Electronics, Communication and "
    "Information Engineering"
)


DEPARTMENT_ALIASES = {
    "computer engineering":
        COMPUTER_ENGINEERING,

    "bct":
        COMPUTER_ENGINEERING,

    "computer":
        COMPUTER_ENGINEERING,

    "electronics, communication and information engineering":
        BEI,

    "electronics communication and information engineering":
        BEI,

    "bei":
        BEI,

    "electronics engineering":
        BEI,

    "computer science": COMPUTER_ENGINEERING,
}


CURRICULUM: dict[
    str,
    dict[
        int,
        list[CurriculumSubject],
    ],
] = {
    COMPUTER_ENGINEERING: {
        1: [
            {
                "code": "ENSH 101",
                "name": "Engineering Mathematics I",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 101",
                "name": "Computer Programming",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENME 101",
                "name": "Engineering Drawing",
                "credits": 2,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 101",
                "name": (
                    "Fundamental of Electrical "
                    "and Electronics Engineering"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENSH 102",
                "name": "Engineering Physics",
                "credits": 4,
                "standard_assessment": True,
            },
            {
                "code": "ENME 106",
                "name": "Engineering Workshop",
                "credits": 1,
                "standard_assessment": True,
            },
        ],

        2: [
            {
                "code": "ENSH 151",
                "name": "Engineering Mathematics II",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 151",
                "name": "Object Oriented Programming",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 152",
                "name": "Digital Logic",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 151",
                "name": "Electronic Device and Circuits",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENSH 153",
                "name": "Engineering Chemistry",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEE 154",
                "name": "Electrical Circuits and Machines",
                "credits": 4,
                "standard_assessment": True,
            },
        ],

        3: [
            {
                "code": "ENSH 201",
                "name": "Engineering Mathematics III",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENSH 204",
                "name": "Communication English",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 201",
                "name": (
                    "Computer Graphics "
                    "and Visualization"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 202",
                "name": "Foundation of Data Science",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 203",
                "name": "Theory of Computation",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 201",
                "name": "Microprocessors",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        4: [
            {
                "code": "ENSH 252",
                "name": "Numerical Methods",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 252",
                "name": "Instrumentation",
                "credits": 4,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 254",
                "name": "Electromagnetics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 252",
                "name": "Data Structure and Algorithm",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 253",
                "name": "Data Communication",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 254",
                "name": "Operating System",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        5: [
            {
                "code": "ENSH 304",
                "name": "Probability and Statistics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 301",
                "name": "Database Management System",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 302",
                "name": "Web Application Programming",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 303",
                "name": (
                    "Computer Organization "
                    "and Architecture"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 304",
                "name": "Computer Networks",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 325-344",
                "name": "Elective I",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        6: [
            {
                "code": "ENCE 356",
                "name": "Engineering Economics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 351",
                "name": "Artificial Intelligence",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 352",
                "name": "Software Engineering",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 353",
                "name": "Simulation and Modeling",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 354",
                "name": "Minor Project",
                "credits": 1,
                "standard_assessment": False,
            },
            {
                "code": "ENCT 385-399",
                "name": "Elective II",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        7: [
            {
                "code": "ENEX 416",
                "name": (
                    "Digital Signal Analysis "
                    "and Processing"
                ),
                "credits": 4,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 411",
                "name": (
                    "Distributed and "
                    "Cloud Computing"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 412",
                "name": "ICT Project Management",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 417",
                "name": (
                    "Energy, Environment "
                    "and Social Engineering"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 435-444",
                "name": "Elective III",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 413",
                "name": "Project I",
                "credits": 2,
                "standard_assessment": False,
            },
        ],

        8: [
            {
                "code": "ENCT 463",
                "name": "Network and Cyber Security",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 465-474",
                "name": "Elective IV",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 462",
                "name": "Internship",
                "credits": 4,
                "standard_assessment": False,
            },
            {
                "code": "ENCT 461",
                "name": "Project II",
                "credits": 4,
                "standard_assessment": False,
            },
        ],
    },


    BEI: {
        1: [
            {
                "code": "ENSH 101",
                "name": "Engineering Mathematics I",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENSH 102",
                "name": "Engineering Physics",
                "credits": 4,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 101",
                "name": "Computer Programming",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENME 101",
                "name": "Engineering Drawing",
                "credits": 2,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 101",
                "name": (
                    "Fundamental of Electrical "
                    "and Electronics Engineering"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENME 106",
                "name": "Engineering Workshop",
                "credits": 1,
                "standard_assessment": True,
            },
        ],

        2: [
            {
                "code": "ENSH 151",
                "name": "Engineering Mathematics II",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 151",
                "name": "Object Oriented Programming",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 151",
                "name": "Electronic Device and Circuits",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 152",
                "name": "Digital Logic",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEE 154",
                "name": "Electrical Circuits and Machines",
                "credits": 4,
                "standard_assessment": True,
            },
            {
                "code": "ENSH 153",
                "name": "Engineering Chemistry",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        3: [
            {
                "code": "ENSH 201",
                "name": "Engineering Mathematics III",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENSH 204",
                "name": "Communication English",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 201",
                "name": (
                    "Computer Graphics "
                    "and Visualization"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 201",
                "name": "Microprocessors",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 202",
                "name": "Advanced Electronics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEE 204",
                "name": "Control System",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        4: [
            {
                "code": "ENSH 252",
                "name": "Numerical Methods",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 251",
                "name": "Discrete Structure",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 252",
                "name": "Instrumentation",
                "credits": 4,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 253",
                "name": (
                    "Computer Organization "
                    "& Architecture"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 254",
                "name": "Electromagnetics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 255",
                "name": "Signals and Systems",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        5: [
            {
                "code": "ENSH 304",
                "name": "Probability and Statistics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCT 305",
                "name": "Artificial Intelligence",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 301",
                "name": "Filter Design",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 302",
                "name": "Embedded Systems",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 303",
                "name": "Propogation and Antennna",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 325-344",
                "name": "Elective I",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        6: [
            {
                "code": "ENCT 355",
                "name": "ICT Project Management",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENCE 356",
                "name": "Engineering Economics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 351",
                "name": "Communication Systems",
                "credits": 4,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 352",
                "name": (
                    "Telecommunication and "
                    "Computer Networks"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 353",
                "name": "Minor Project",
                "credits": 1,
                "standard_assessment": False,
            },
            {
                "code": "ENEX 385-399",
                "name": "Elective II",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        7: [
            {
                "code": "ENEX 411",
                "name": "RF and Microwave Engineering",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 412",
                "name": "Robotics",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 413",
                "name": "Digital Signal Processing",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 435-444",
                "name": "Elective III",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 414",
                "name": "Project I",
                "credits": 2,
                "standard_assessment": False,
            },
            {
                "code": "ENEX 415",
                "name": "Wireless Communication",
                "credits": 3,
                "standard_assessment": True,
            },
        ],

        8: [
            {
                "code": "ENEX 463",
                "name": (
                    "Energy, Environment "
                    "and Social Engineering"
                ),
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 462",
                "name": "Internship",
                "credits": 4,
                "standard_assessment": False,
            },
            {
                "code": "ENEX 465-484",
                "name": "Elective IV",
                "credits": 3,
                "standard_assessment": True,
            },
            {
                "code": "ENEX 461",
                "name": "Project II",
                "credits": 4,
                "standard_assessment": False,
            },
        ],
    },
}


def normalize_department(
    department: str,
) -> str:
    normalized = (
        department
        .strip()
        .lower()
    )

    canonical_department = (
        DEPARTMENT_ALIASES.get(
            normalized
        )
    )

    if canonical_department is None:
        raise ValueError(
            "Unsupported department. "
            "Supported departments are "
            "Computer Engineering and BEI."
        )

    return canonical_department


def get_curriculum_subjects(
    department: str,
    semester: int,
) -> list[CurriculumSubject]:
    if semester < 1 or semester > 8:
        raise ValueError(
            "Semester must be between 1 and 8."
        )

    canonical_department = (
        normalize_department(
            department
        )
    )

    return CURRICULUM[
        canonical_department
    ][semester]