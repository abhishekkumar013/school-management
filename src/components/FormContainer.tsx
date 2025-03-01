import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import { getUserAuth } from "@/lib/utils";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;
  // const currentUserId = userId;
  const { userId: currentUserId, role } = await getUserAuth();

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "lesson":
        const [lessonSubjects, lessonClasses, lessonTeachers] =
          await Promise.all([
            prisma.subject.findMany({
              select: { id: true, name: true },
              orderBy: { name: "asc" },
            }),
            prisma.class.findMany({
              select: { id: true, name: true },
              orderBy: { name: "asc" },
            }),
            prisma.teacher.findMany({
              select: { id: true, name: true, surname: true },
              orderBy: { name: "asc" },
            }),
          ]);

        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
        };
        break;
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: {
            id: true,
            name: true,
            subject: {
              select: { name: true },
            },
            class: {
              select: { name: true },
            },
          },
          orderBy: { name: "asc" },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      case "parent":
        const parents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { parents };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        });
        relatedData = { classes: eventClasses };
        break;
      case "result":
        const [resultStudents, resultExams, resultAssignments] =
          await Promise.all([
            prisma.student.findMany({
              select: { id: true, name: true, surname: true },
              orderBy: { name: "asc" },
            }),
            prisma.exam.findMany({
              select: { id: true, title: true },
              orderBy: { title: "asc" },
            }),
            prisma.assignment.findMany({
              select: { id: true, title: true },
              orderBy: { title: "asc" },
            }),
          ]);
        relatedData = {
          students: resultStudents,
          exams: resultExams,
          assignments: resultAssignments,
        };
        break;
      case "announcement":
        if (type !== "delete") {
          const classes = await prisma.class.findMany({
            select: {
              id: true,
              name: true,
            },
            ...(role === "teacher"
              ? {
                  where: {
                    lessons: {
                      some: { teacherId: currentUserId! },
                    },
                  },
                }
              : {}),
            orderBy: { name: "asc" },
          });

          relatedData = { classes };
        }
        break;
      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
