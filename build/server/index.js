import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, createCookieSessionStorage, redirect, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, Link, useNavigate, useSearchParams, useLocation, useLoaderData, useRevalidator, useParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { GraduationCap, ChevronDown, Radio, Fingerprint, UploadCloud, Award, FileSpreadsheet, ShieldCheck, LogIn, X, Menu, ArrowRight, Zap, FileCheck, Clock, Users, QrCode, Search, Check, Download, Lock, BarChart3, FileText, UserPlus, CheckCircle2, AlertTriangle, AlertCircle, Mail, EyeOff, Eye, User, Building, BookOpen, ArrowLeft, Loader2, LayoutDashboard, Settings, PlusCircle, LogOut, CheckCircle, FolderOpen, Trash2, Edit2, Calendar, Layers, Upload, FileUp, RefreshCw, PowerOff, Plus, Copy, Sparkles, RotateCcw, UserCheck, KeyRound, Info } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import mammoth from "mammoth";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": '// Prisma schema for ClassMark - University Attendance Management Platform\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum CourseStatus {\n  ACTIVE\n  ARCHIVED\n}\n\nenum EnrolmentStatus {\n  ACTIVE\n  WITHDRAWN\n}\n\nenum SessionStatus {\n  OPEN\n  CLOSED\n  CANCELLED\n}\n\nenum AttendanceStatus {\n  PRESENT\n  ABSENT\n  EXCUSED\n  LATE\n}\n\nenum VerificationMethod {\n  EMAIL_OTP\n  STUDENT_PIN\n  OPEN_CHECKIN\n}\n\nmodel User {\n  id                        String             @id @default(cuid())\n  email                     String             @unique\n  passwordHash              String\n  fullName                  String\n  institution               String?\n  department                String?\n  isEmailVerified           Boolean            @default(false)\n  timeZone                  String             @default("Africa/Lagos")\n  defaultThreshold          Float              @default(60.0)\n  defaultSessionDuration    Int                @default(30) // in minutes\n  defaultVerificationMethod VerificationMethod @default(STUDENT_PIN)\n  createdAt                 DateTime           @default(now())\n  updatedAt                 DateTime           @updatedAt\n\n  courses                 Course[]\n  emailVerificationTokens EmailVerificationToken[]\n  passwordResetTokens     PasswordResetToken[]\n  auditLogs               AuditLog[]\n\n  @@map("users")\n}\n\nmodel EmailVerificationToken {\n  id        String   @id @default(cuid())\n  token     String   @unique\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  expiresAt DateTime\n  createdAt DateTime @default(now())\n\n  @@map("email_verification_tokens")\n}\n\nmodel PasswordResetToken {\n  id        String    @id @default(cuid())\n  token     String    @unique\n  userId    String\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  expiresAt DateTime\n  usedAt    DateTime?\n  createdAt DateTime  @default(now())\n\n  @@map("password_reset_tokens")\n}\n\nmodel Course {\n  id                  String       @id @default(cuid())\n  lecturerId          String\n  lecturer            User         @relation(fields: [lecturerId], references: [id], onDelete: Cascade)\n  code                String // e.g. CSC 201\n  title               String // e.g. Data Structures & Algorithms\n  department          String?\n  faculty             String?\n  session             String // e.g. 2026/2027\n  semester            String // e.g. First Semester\n  classGroup          String?\n  description         String?\n  expectedSessions    Int?\n  attendanceThreshold Float        @default(60.0)\n  status              CourseStatus @default(ACTIVE)\n  createdAt           DateTime     @default(now())\n  updatedAt           DateTime     @updatedAt\n\n  enrolments         CourseEnrolment[]\n  attendanceSessions AttendanceSession[]\n  auditLogs          AuditLog[]\n\n  @@unique([lecturerId, code, session, semester])\n  @@index([lecturerId])\n  @@map("courses")\n}\n\nmodel Student {\n  id           String   @id @default(cuid())\n  matricNumber String   @unique // Primary unique identifier\n  fullName     String\n  email        String?\n  department   String?\n  faculty      String?\n  level        String? // 100, 200, 300, etc.\n  studentPin   String? // Optional lecturer-managed 4-6 digit PIN\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  enrolments CourseEnrolment[]\n  otps       StudentVerificationOTP[]\n\n  @@index([matricNumber])\n  @@map("students")\n}\n\nmodel CourseEnrolment {\n  id          String          @id @default(cuid())\n  courseId    String\n  studentId   String\n  status      EnrolmentStatus @default(ACTIVE)\n  enrolledAt  DateTime        @default(now())\n  withdrawnAt DateTime?\n\n  course  Course             @relation(fields: [courseId], references: [id], onDelete: Cascade)\n  student Student            @relation(fields: [studentId], references: [id], onDelete: Cascade)\n  records AttendanceRecord[]\n\n  @@unique([courseId, studentId])\n  @@index([courseId])\n  @@index([studentId])\n  @@map("course_enrolments")\n}\n\nmodel AttendanceSession {\n  id                 String             @id @default(cuid())\n  courseId           String\n  sessionDate        DateTime           @default(now())\n  topic              String?\n  token              String             @unique // Cryptographic public check-in token\n  sessionPin         String? // In-class attendance PIN displayed on board/screen\n  status             SessionStatus      @default(OPEN)\n  startTime          DateTime           @default(now())\n  endTime            DateTime?\n  expiresAt          DateTime\n  verificationMethod VerificationMethod @default(STUDENT_PIN)\n  allowLateCheckin   Boolean            @default(false)\n  createdAt          DateTime           @default(now())\n  updatedAt          DateTime           @updatedAt\n\n  course    Course                   @relation(fields: [courseId], references: [id], onDelete: Cascade)\n  records   AttendanceRecord[]\n  otps      StudentVerificationOTP[]\n  auditLogs AuditLog[]\n\n  @@index([courseId])\n  @@index([token])\n  @@map("attendance_sessions")\n}\n\nmodel AttendanceRecord {\n  id                   String             @id @default(cuid())\n  sessionId            String\n  enrolmentId          String\n  status               AttendanceStatus   @default(PRESENT)\n  verificationMethod   VerificationMethod\n  verificationStatus   String             @default("VERIFIED") // VERIFIED, MANUAL_OVERRIDE, EXCUSED\n  checkInTime          DateTime           @default(now())\n  ipAddress            String?\n  userAgent            String?\n  isManualOverride     Boolean            @default(false)\n  overrideReason       String?\n  overrideByLecturerId String?\n  createdAt            DateTime           @default(now())\n  updatedAt            DateTime           @updatedAt\n\n  session   AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n  enrolment CourseEnrolment   @relation(fields: [enrolmentId], references: [id], onDelete: Cascade)\n\n  @@unique([sessionId, enrolmentId]) // Guarantees single attendance entry per student per session\n  @@index([sessionId])\n  @@index([enrolmentId])\n  @@map("attendance_records")\n}\n\nmodel StudentVerificationOTP {\n  id         String    @id @default(cuid())\n  sessionId  String\n  studentId  String\n  otpHash    String\n  email      String\n  expiresAt  DateTime\n  verifiedAt DateTime?\n  attempts   Int       @default(0)\n  createdAt  DateTime  @default(now())\n\n  session AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n  student Student           @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  @@index([sessionId, studentId])\n  @@map("student_verification_otps")\n}\n\nmodel AuditLog {\n  id        String   @id @default(cuid())\n  userId    String\n  courseId  String?\n  sessionId String?\n  action    String // e.g. "MANUAL_OVERRIDE", "COURSE_ARCHIVED", "ROSTER_IMPORTED"\n  details   String // JSON serialized audit information\n  ipAddress String?\n  createdAt DateTime @default(now())\n\n  user    User               @relation(fields: [userId], references: [id], onDelete: Cascade)\n  course  Course?            @relation(fields: [courseId], references: [id], onDelete: SetNull)\n  session AttendanceSession? @relation(fields: [sessionId], references: [id], onDelete: SetNull)\n\n  @@index([userId])\n  @@index([courseId])\n  @@index([sessionId])\n  @@map("audit_logs")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"passwordHash","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"institution","kind":"scalar","type":"String"},{"name":"department","kind":"scalar","type":"String"},{"name":"isEmailVerified","kind":"scalar","type":"Boolean"},{"name":"timeZone","kind":"scalar","type":"String"},{"name":"defaultThreshold","kind":"scalar","type":"Float"},{"name":"defaultSessionDuration","kind":"scalar","type":"Int"},{"name":"defaultVerificationMethod","kind":"enum","type":"VerificationMethod"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToUser"},{"name":"emailVerificationTokens","kind":"object","type":"EmailVerificationToken","relationName":"EmailVerificationTokenToUser"},{"name":"passwordResetTokens","kind":"object","type":"PasswordResetToken","relationName":"PasswordResetTokenToUser"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"AuditLogToUser"}],"dbName":"users","schema":null},"EmailVerificationToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmailVerificationTokenToUser"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"email_verification_tokens","schema":null},"PasswordResetToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PasswordResetTokenToUser"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"usedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"password_reset_tokens","schema":null},"Course":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"lecturerId","kind":"scalar","type":"String"},{"name":"lecturer","kind":"object","type":"User","relationName":"CourseToUser"},{"name":"code","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"department","kind":"scalar","type":"String"},{"name":"faculty","kind":"scalar","type":"String"},{"name":"session","kind":"scalar","type":"String"},{"name":"semester","kind":"scalar","type":"String"},{"name":"classGroup","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"expectedSessions","kind":"scalar","type":"Int"},{"name":"attendanceThreshold","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"CourseStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"enrolments","kind":"object","type":"CourseEnrolment","relationName":"CourseToCourseEnrolment"},{"name":"attendanceSessions","kind":"object","type":"AttendanceSession","relationName":"AttendanceSessionToCourse"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"AuditLogToCourse"}],"dbName":"courses","schema":null},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"matricNumber","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"department","kind":"scalar","type":"String"},{"name":"faculty","kind":"scalar","type":"String"},{"name":"level","kind":"scalar","type":"String"},{"name":"studentPin","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"enrolments","kind":"object","type":"CourseEnrolment","relationName":"CourseEnrolmentToStudent"},{"name":"otps","kind":"object","type":"StudentVerificationOTP","relationName":"StudentToStudentVerificationOTP"}],"dbName":"students","schema":null},"CourseEnrolment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"courseId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"EnrolmentStatus"},{"name":"enrolledAt","kind":"scalar","type":"DateTime"},{"name":"withdrawnAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToCourseEnrolment"},{"name":"student","kind":"object","type":"Student","relationName":"CourseEnrolmentToStudent"},{"name":"records","kind":"object","type":"AttendanceRecord","relationName":"AttendanceRecordToCourseEnrolment"}],"dbName":"course_enrolments","schema":null},"AttendanceSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"courseId","kind":"scalar","type":"String"},{"name":"sessionDate","kind":"scalar","type":"DateTime"},{"name":"topic","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"sessionPin","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"SessionStatus"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"verificationMethod","kind":"enum","type":"VerificationMethod"},{"name":"allowLateCheckin","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"AttendanceSessionToCourse"},{"name":"records","kind":"object","type":"AttendanceRecord","relationName":"AttendanceRecordToAttendanceSession"},{"name":"otps","kind":"object","type":"StudentVerificationOTP","relationName":"AttendanceSessionToStudentVerificationOTP"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"AttendanceSessionToAuditLog"}],"dbName":"attendance_sessions","schema":null},"AttendanceRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"enrolmentId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"AttendanceStatus"},{"name":"verificationMethod","kind":"enum","type":"VerificationMethod"},{"name":"verificationStatus","kind":"scalar","type":"String"},{"name":"checkInTime","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"isManualOverride","kind":"scalar","type":"Boolean"},{"name":"overrideReason","kind":"scalar","type":"String"},{"name":"overrideByLecturerId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"session","kind":"object","type":"AttendanceSession","relationName":"AttendanceRecordToAttendanceSession"},{"name":"enrolment","kind":"object","type":"CourseEnrolment","relationName":"AttendanceRecordToCourseEnrolment"}],"dbName":"attendance_records","schema":null},"StudentVerificationOTP":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"otpHash","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"verifiedAt","kind":"scalar","type":"DateTime"},{"name":"attempts","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"session","kind":"object","type":"AttendanceSession","relationName":"AttendanceSessionToStudentVerificationOTP"},{"name":"student","kind":"object","type":"Student","relationName":"StudentToStudentVerificationOTP"}],"dbName":"student_verification_otps","schema":null},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"courseId","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"details","kind":"scalar","type":"String"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AuditLogToUser"},{"name":"course","kind":"object","type":"Course","relationName":"AuditLogToCourse"},{"name":"session","kind":"object","type":"AttendanceSession","relationName":"AttendanceSessionToAuditLog"}],"dbName":"audit_logs","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","lecturer","course","enrolments","session","enrolment","records","otps","user","auditLogs","_count","student","attendanceSessions","courses","emailVerificationTokens","passwordResetTokens","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_avg","_sum","_min","_max","User.groupBy","User.aggregate","EmailVerificationToken.findUnique","EmailVerificationToken.findUniqueOrThrow","EmailVerificationToken.findFirst","EmailVerificationToken.findFirstOrThrow","EmailVerificationToken.findMany","EmailVerificationToken.createOne","EmailVerificationToken.createMany","EmailVerificationToken.createManyAndReturn","EmailVerificationToken.updateOne","EmailVerificationToken.updateMany","EmailVerificationToken.updateManyAndReturn","EmailVerificationToken.upsertOne","EmailVerificationToken.deleteOne","EmailVerificationToken.deleteMany","EmailVerificationToken.groupBy","EmailVerificationToken.aggregate","PasswordResetToken.findUnique","PasswordResetToken.findUniqueOrThrow","PasswordResetToken.findFirst","PasswordResetToken.findFirstOrThrow","PasswordResetToken.findMany","PasswordResetToken.createOne","PasswordResetToken.createMany","PasswordResetToken.createManyAndReturn","PasswordResetToken.updateOne","PasswordResetToken.updateMany","PasswordResetToken.updateManyAndReturn","PasswordResetToken.upsertOne","PasswordResetToken.deleteOne","PasswordResetToken.deleteMany","PasswordResetToken.groupBy","PasswordResetToken.aggregate","Course.findUnique","Course.findUniqueOrThrow","Course.findFirst","Course.findFirstOrThrow","Course.findMany","Course.createOne","Course.createMany","Course.createManyAndReturn","Course.updateOne","Course.updateMany","Course.updateManyAndReturn","Course.upsertOne","Course.deleteOne","Course.deleteMany","Course.groupBy","Course.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","CourseEnrolment.findUnique","CourseEnrolment.findUniqueOrThrow","CourseEnrolment.findFirst","CourseEnrolment.findFirstOrThrow","CourseEnrolment.findMany","CourseEnrolment.createOne","CourseEnrolment.createMany","CourseEnrolment.createManyAndReturn","CourseEnrolment.updateOne","CourseEnrolment.updateMany","CourseEnrolment.updateManyAndReturn","CourseEnrolment.upsertOne","CourseEnrolment.deleteOne","CourseEnrolment.deleteMany","CourseEnrolment.groupBy","CourseEnrolment.aggregate","AttendanceSession.findUnique","AttendanceSession.findUniqueOrThrow","AttendanceSession.findFirst","AttendanceSession.findFirstOrThrow","AttendanceSession.findMany","AttendanceSession.createOne","AttendanceSession.createMany","AttendanceSession.createManyAndReturn","AttendanceSession.updateOne","AttendanceSession.updateMany","AttendanceSession.updateManyAndReturn","AttendanceSession.upsertOne","AttendanceSession.deleteOne","AttendanceSession.deleteMany","AttendanceSession.groupBy","AttendanceSession.aggregate","AttendanceRecord.findUnique","AttendanceRecord.findUniqueOrThrow","AttendanceRecord.findFirst","AttendanceRecord.findFirstOrThrow","AttendanceRecord.findMany","AttendanceRecord.createOne","AttendanceRecord.createMany","AttendanceRecord.createManyAndReturn","AttendanceRecord.updateOne","AttendanceRecord.updateMany","AttendanceRecord.updateManyAndReturn","AttendanceRecord.upsertOne","AttendanceRecord.deleteOne","AttendanceRecord.deleteMany","AttendanceRecord.groupBy","AttendanceRecord.aggregate","StudentVerificationOTP.findUnique","StudentVerificationOTP.findUniqueOrThrow","StudentVerificationOTP.findFirst","StudentVerificationOTP.findFirstOrThrow","StudentVerificationOTP.findMany","StudentVerificationOTP.createOne","StudentVerificationOTP.createMany","StudentVerificationOTP.createManyAndReturn","StudentVerificationOTP.updateOne","StudentVerificationOTP.updateMany","StudentVerificationOTP.updateManyAndReturn","StudentVerificationOTP.upsertOne","StudentVerificationOTP.deleteOne","StudentVerificationOTP.deleteMany","StudentVerificationOTP.groupBy","StudentVerificationOTP.aggregate","AuditLog.findUnique","AuditLog.findUniqueOrThrow","AuditLog.findFirst","AuditLog.findFirstOrThrow","AuditLog.findMany","AuditLog.createOne","AuditLog.createMany","AuditLog.createManyAndReturn","AuditLog.updateOne","AuditLog.updateMany","AuditLog.updateManyAndReturn","AuditLog.upsertOne","AuditLog.deleteOne","AuditLog.deleteMany","AuditLog.groupBy","AuditLog.aggregate","AND","OR","NOT","id","userId","courseId","sessionId","action","details","ipAddress","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","studentId","otpHash","email","expiresAt","verifiedAt","attempts","enrolmentId","AttendanceStatus","status","VerificationMethod","verificationMethod","verificationStatus","checkInTime","userAgent","isManualOverride","overrideReason","overrideByLecturerId","updatedAt","sessionDate","topic","token","sessionPin","SessionStatus","startTime","endTime","allowLateCheckin","EnrolmentStatus","enrolledAt","withdrawnAt","matricNumber","fullName","department","faculty","level","studentPin","every","some","none","lecturerId","code","title","semester","classGroup","description","expectedSessions","attendanceThreshold","CourseStatus","usedAt","passwordHash","institution","isEmailVerified","timeZone","defaultThreshold","defaultSessionDuration","defaultVerificationMethod","sessionId_enrolmentId","courseId_studentId","lecturerId_code_session_semester","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "wwVcoAEUCwAA2wIAIA8AANgCACAQAADZAgAgEQAA2gIAILoBAADTAgAwuwEAADgAELwBAADTAgAwvQEBAAAAAcQBQADEAgAh0gEBAAAAAeEBQADEAgAh7gEBAMICACHvAQEAwwIAIYACAQDCAgAhgQIBAMMCACGCAiAA1AIAIYMCAQDCAgAhhAIIANUCACGFAgIA1gIAIYYCAADXAtoBIgEAAAABACAWAwAA3gIAIAUAAMUCACAGAQDCAgAhCwAA2wIAIA4AAPUCACC6AQAA8gIAMLsBAAADABC8AQAA8gIAML0BAQDCAgAhxAFAAMQCACHYAQAA9AL_ASLhAUAAxAIAIe8BAQDDAgAh8AEBAMMCACH2AQEAwgIAIfcBAQDCAgAh-AEBAMICACH5AQEAwgIAIfoBAQDDAgAh-wEBAMMCACH8AQIA8wIAIf0BCADVAgAhCQMAAO8EACAFAAD3AwAgCwAA7gQAIA4AAPUEACDvAQAA9gIAIPABAAD2AgAg-gEAAPYCACD7AQAA9gIAIPwBAAD2AgAgFwMAAN4CACAFAADFAgAgBgEAwgIAIQsAANsCACAOAAD1AgAgugEAAPICADC7AQAAAwAQvAEAAPICADC9AQEAAAABxAFAAMQCACHYAQAA9AL_ASLhAUAAxAIAIe8BAQDDAgAh8AEBAMMCACH2AQEAwgIAIfcBAQDCAgAh-AEBAMICACH5AQEAwgIAIfoBAQDDAgAh-wEBAMMCACH8AQIA8wIAIf0BCADVAgAhiQIAAPECACADAAAAAwAgAQAABAAwAgAABQAgDAQAAOICACAIAADjAgAgDQAA7QIAILoBAADvAgAwuwEAAAcAELwBAADvAgAwvQEBAMICACG_AQEAwgIAIdABAQDCAgAh2AEAAPAC6wEi6wFAAMQCACHsAUAA3QIAIQQEAADwBAAgCAAA8QQAIA0AAPQEACDsAQAA9gIAIA0EAADiAgAgCAAA4wIAIA0AAO0CACC6AQAA7wIAMLsBAAAHABC8AQAA7wIAML0BAQAAAAG_AQEAwgIAIdABAQDCAgAh2AEAAPAC6wEi6wFAAMQCACHsAUAA3QIAIYgCAADuAgAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAOBgAA6gIAIA0AAO0CACC6AQAA7AIAMLsBAAAMABC8AQAA7AIAML0BAQDCAgAhwAEBAMICACHEAUAAxAIAIdABAQDCAgAh0QEBAMICACHSAQEAwgIAIdMBQADEAgAh1AFAAN0CACHVAQIA1gIAIQMGAADyBAAgDQAA9AQAINQBAAD2AgAgDgYAAOoCACANAADtAgAgugEAAOwCADC7AQAADAAQvAEAAOwCADC9AQEAAAABwAEBAMICACHEAUAAxAIAIdABAQDCAgAh0QEBAMICACHSAQEAwgIAIdMBQADEAgAh1AFAAN0CACHVAQIA1gIAIQMAAAAMACABAAANADACAAAOACATBgAA6gIAIAcAAOsCACC6AQAA6AIAMLsBAAAQABC8AQAA6AIAML0BAQDCAgAhwAEBAMICACHDAQEAwwIAIcQBQADEAgAh1gEBAMICACHYAQAA6QLYASLaAQAA1wLaASLbAQEAwgIAIdwBQADEAgAh3QEBAMMCACHeASAA1AIAId8BAQDDAgAh4AEBAMMCACHhAUAAxAIAIQYGAADyBAAgBwAA8wQAIMMBAAD2AgAg3QEAAPYCACDfAQAA9gIAIOABAAD2AgAgFAYAAOoCACAHAADrAgAgugEAAOgCADC7AQAAEAAQvAEAAOgCADC9AQEAAAABwAEBAMICACHDAQEAwwIAIcQBQADEAgAh1gEBAMICACHYAQAA6QLYASLaAQAA1wLaASLbAQEAwgIAIdwBQADEAgAh3QEBAMMCACHeASAA1AIAId8BAQDDAgAh4AEBAMMCACHhAUAAxAIAIYcCAADnAgAgAwAAABAAIAEAABEAMAIAABIAIAMAAAAMACABAAANADACAAAOACAOBAAA5QIAIAYAAOYCACAKAADeAgAgugEAAOQCADC7AQAAFQAQvAEAAOQCADC9AQEAwgIAIb4BAQDCAgAhvwEBAMMCACHAAQEAwwIAIcEBAQDCAgAhwgEBAMICACHDAQEAwwIAIcQBQADEAgAhBgQAAPAEACAGAADyBAAgCgAA7wQAIL8BAAD2AgAgwAEAAPYCACDDAQAA9gIAIA4EAADlAgAgBgAA5gIAIAoAAN4CACC6AQAA5AIAMLsBAAAVABC8AQAA5AIAML0BAQAAAAG-AQEAwgIAIb8BAQDDAgAhwAEBAMMCACHBAQEAwgIAIcIBAQDCAgAhwwEBAMMCACHEAUAAxAIAIQMAAAAVACABAAAWADACAAAXACABAAAAAwAgFQQAAOICACAIAADjAgAgCQAAxgIAIAsAANsCACC6AQAA4AIAMLsBAAAaABC8AQAA4AIAML0BAQDCAgAhvwEBAMICACHEAUAAxAIAIdMBQADEAgAh2AEAAOEC5wEi2gEAANcC2gEi4QFAAMQCACHiAUAAxAIAIeMBAQDDAgAh5AEBAMICACHlAQEAwwIAIecBQADEAgAh6AFAAN0CACHpASAA1AIAIQEAAAAaACABAAAAEAAgAQAAAAwAIAEAAAAVACABAAAABwAgAQAAAAwAIAMAAAAQACABAAARADACAAASACABAAAAEAAgBwQAAPAEACAIAADxBAAgCQAA-AMAIAsAAO4EACDjAQAA9gIAIOUBAAD2AgAg6AEAAPYCACAVBAAA4gIAIAgAAOMCACAJAADGAgAgCwAA2wIAILoBAADgAgAwuwEAABoAELwBAADgAgAwvQEBAAAAAb8BAQDCAgAhxAFAAMQCACHTAUAAxAIAIdgBAADhAucBItoBAADXAtoBIuEBQADEAgAh4gFAAMQCACHjAQEAwwIAIeQBAQAAAAHlAQEAwwIAIecBQADEAgAh6AFAAN0CACHpASAA1AIAIQMAAAAaACABAAAjADACAAAkACADAAAAFQAgAQAAFgAwAgAAFwAgAQAAAAcAIAEAAAAaACABAAAAFQAgCQoAAN4CACC6AQAA3wIAMLsBAAAqABC8AQAA3wIAML0BAQDCAgAhvgEBAMICACHEAUAAxAIAIdMBQADEAgAh5AEBAMICACEBCgAA7wQAIAkKAADeAgAgugEAAN8CADC7AQAAKgAQvAEAAN8CADC9AQEAAAABvgEBAMICACHEAUAAxAIAIdMBQADEAgAh5AEBAAAAAQMAAAAqACABAAArADACAAAsACAKCgAA3gIAILoBAADcAgAwuwEAAC4AELwBAADcAgAwvQEBAMICACG-AQEAwgIAIcQBQADEAgAh0wFAAMQCACHkAQEAwgIAIf8BQADdAgAhAgoAAO8EACD_AQAA9gIAIAoKAADeAgAgugEAANwCADC7AQAALgAQvAEAANwCADC9AQEAAAABvgEBAMICACHEAUAAxAIAIdMBQADEAgAh5AEBAAAAAf8BQADdAgAhAwAAAC4AIAEAAC8AMAIAADAAIAMAAAAVACABAAAWADACAAAXACABAAAAAwAgAQAAACoAIAEAAAAuACABAAAAFQAgAQAAAAEAIBQLAADbAgAgDwAA2AIAIBAAANkCACARAADaAgAgugEAANMCADC7AQAAOAAQvAEAANMCADC9AQEAwgIAIcQBQADEAgAh0gEBAMICACHhAUAAxAIAIe4BAQDCAgAh7wEBAMMCACGAAgEAwgIAIYECAQDDAgAhggIgANQCACGDAgEAwgIAIYQCCADVAgAhhQICANYCACGGAgAA1wLaASIGCwAA7gQAIA8AAOsEACAQAADsBAAgEQAA7QQAIO8BAAD2AgAggQIAAPYCACADAAAAOAAgAQAAOQAwAgAAAQAgAwAAADgAIAEAADkAMAIAAAEAIAMAAAA4ACABAAA5ADACAAABACARCwAA6gQAIA8AAOcEACAQAADoBAAgEQAA6QQAIL0BAQAAAAHEAUAAAAAB0gEBAAAAAeEBQAAAAAHuAQEAAAAB7wEBAAAAAYACAQAAAAGBAgEAAAABggIgAAAAAYMCAQAAAAGEAggAAAABhQICAAAAAYYCAAAA2gECARcAAD0AIA29AQEAAAABxAFAAAAAAdIBAQAAAAHhAUAAAAAB7gEBAAAAAe8BAQAAAAGAAgEAAAABgQIBAAAAAYICIAAAAAGDAgEAAAABhAIIAAAAAYUCAgAAAAGGAgAAANoBAgEXAAA_ADABFwAAPwAwEQsAALkEACAPAAC2BAAgEAAAtwQAIBEAALgEACC9AQEA-gIAIcQBQAD8AgAh0gEBAPoCACHhAUAA_AIAIe4BAQD6AgAh7wEBAPsCACGAAgEA-gIAIYECAQD7AgAhggIgAJMDACGDAgEA-gIAIYQCCAD_AwAhhQICAIkDACGGAgAAkgPaASICAAAAAQAgFwAAQgAgDb0BAQD6AgAhxAFAAPwCACHSAQEA-gIAIeEBQAD8AgAh7gEBAPoCACHvAQEA-wIAIYACAQD6AgAhgQIBAPsCACGCAiAAkwMAIYMCAQD6AgAhhAIIAP8DACGFAgIAiQMAIYYCAACSA9oBIgIAAAA4ACAXAABEACACAAAAOAAgFwAARAAgAwAAAAEAIB4AAD0AIB8AAEIAIAEAAAABACABAAAAOAAgBwwAALEEACAkAACyBAAgJQAAtQQAICYAALQEACAnAACzBAAg7wEAAPYCACCBAgAA9gIAIBC6AQAA0gIAMLsBAABLABC8AQAA0gIAML0BAQCcAgAhxAFAAJ4CACHSAQEAnAIAIeEBQACeAgAh7gEBAJwCACHvAQEAnQIAIYACAQCcAgAhgQIBAJ0CACGCAiAAsQIAIYMCAQCcAgAhhAIIAMkCACGFAgIAqQIAIYYCAACwAtoBIgMAAAA4ACABAABKADAjAABLACADAAAAOAAgAQAAOQAwAgAAAQAgAQAAACwAIAEAAAAsACADAAAAKgAgAQAAKwAwAgAALAAgAwAAACoAIAEAACsAMAIAACwAIAMAAAAqACABAAArADACAAAsACAGCgAAsAQAIL0BAQAAAAG-AQEAAAABxAFAAAAAAdMBQAAAAAHkAQEAAAABARcAAFMAIAW9AQEAAAABvgEBAAAAAcQBQAAAAAHTAUAAAAAB5AEBAAAAAQEXAABVADABFwAAVQAwBgoAAK8EACC9AQEA-gIAIb4BAQD6AgAhxAFAAPwCACHTAUAA_AIAIeQBAQD6AgAhAgAAACwAIBcAAFgAIAW9AQEA-gIAIb4BAQD6AgAhxAFAAPwCACHTAUAA_AIAIeQBAQD6AgAhAgAAACoAIBcAAFoAIAIAAAAqACAXAABaACADAAAALAAgHgAAUwAgHwAAWAAgAQAAACwAIAEAAAAqACADDAAArAQAICYAAK4EACAnAACtBAAgCLoBAADRAgAwuwEAAGEAELwBAADRAgAwvQEBAJwCACG-AQEAnAIAIcQBQACeAgAh0wFAAJ4CACHkAQEAnAIAIQMAAAAqACABAABgADAjAABhACADAAAAKgAgAQAAKwAwAgAALAAgAQAAADAAIAEAAAAwACADAAAALgAgAQAALwAwAgAAMAAgAwAAAC4AIAEAAC8AMAIAADAAIAMAAAAuACABAAAvADACAAAwACAHCgAAqwQAIL0BAQAAAAG-AQEAAAABxAFAAAAAAdMBQAAAAAHkAQEAAAAB_wFAAAAAAQEXAABpACAGvQEBAAAAAb4BAQAAAAHEAUAAAAAB0wFAAAAAAeQBAQAAAAH_AUAAAAABARcAAGsAMAEXAABrADAHCgAAqgQAIL0BAQD6AgAhvgEBAPoCACHEAUAA_AIAIdMBQAD8AgAh5AEBAPoCACH_AUAAiAMAIQIAAAAwACAXAABuACAGvQEBAPoCACG-AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHkAQEA-gIAIf8BQACIAwAhAgAAAC4AIBcAAHAAIAIAAAAuACAXAABwACADAAAAMAAgHgAAaQAgHwAAbgAgAQAAADAAIAEAAAAuACAEDAAApwQAICYAAKkEACAnAACoBAAg_wEAAPYCACAJugEAANACADC7AQAAdwAQvAEAANACADC9AQEAnAIAIb4BAQCcAgAhxAFAAJ4CACHTAUAAngIAIeQBAQCcAgAh_wFAAKgCACEDAAAALgAgAQAAdgAwIwAAdwAgAwAAAC4AIAEAAC8AMAIAADAAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgEwMAAKMEACAFAACkBAAgBgEAAAABCwAApgQAIA4AAKUEACC9AQEAAAABxAFAAAAAAdgBAAAA_wEC4QFAAAAAAe8BAQAAAAHwAQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAAAAAfoBAQAAAAH7AQEAAAAB_AECAAAAAf0BCAAAAAEBFwAAfwAgDwYBAAAAAb0BAQAAAAHEAUAAAAAB2AEAAAD_AQLhAUAAAAAB7wEBAAAAAfABAQAAAAH2AQEAAAAB9wEBAAAAAfgBAQAAAAH5AQEAAAAB-gEBAAAAAfsBAQAAAAH8AQIAAAAB_QEIAAAAAQEXAACBAQAwARcAAIEBADATAwAAgQQAIAUAAIIEACAGAQD6AgAhCwAAhAQAIA4AAIMEACC9AQEA-gIAIcQBQAD8AgAh2AEAAIAE_wEi4QFAAPwCACHvAQEA-wIAIfABAQD7AgAh9gEBAPoCACH3AQEA-gIAIfgBAQD6AgAh-QEBAPoCACH6AQEA-wIAIfsBAQD7AgAh_AECAP4DACH9AQgA_wMAIQIAAAAFACAXAACEAQAgDwYBAPoCACG9AQEA-gIAIcQBQAD8AgAh2AEAAIAE_wEi4QFAAPwCACHvAQEA-wIAIfABAQD7AgAh9gEBAPoCACH3AQEA-gIAIfgBAQD6AgAh-QEBAPoCACH6AQEA-wIAIfsBAQD7AgAh_AECAP4DACH9AQgA_wMAIQIAAAADACAXAACGAQAgAgAAAAMAIBcAAIYBACADAAAABQAgHgAAfwAgHwAAhAEAIAEAAAAFACABAAAAAwAgCgwAAPkDACAkAAD6AwAgJQAA_QMAICYAAPwDACAnAAD7AwAg7wEAAPYCACDwAQAA9gIAIPoBAAD2AgAg-wEAAPYCACD8AQAA9gIAIBIGAQCcAgAhugEAAMcCADC7AQAAjQEAELwBAADHAgAwvQEBAJwCACHEAUAAngIAIdgBAADKAv8BIuEBQACeAgAh7wEBAJ0CACHwAQEAnQIAIfYBAQCcAgAh9wEBAJwCACH4AQEAnAIAIfkBAQCcAgAh-gEBAJ0CACH7AQEAnQIAIfwBAgDIAgAh_QEIAMkCACEDAAAAAwAgAQAAjAEAMCMAAI0BACADAAAAAwAgAQAABAAwAgAABQAgDwUAAMUCACAJAADGAgAgugEAAMECADC7AQAAkwEAELwBAADBAgAwvQEBAAAAAcQBQADEAgAh0gEBAMMCACHhAUAAxAIAIe0BAQAAAAHuAQEAwgIAIe8BAQDDAgAh8AEBAMMCACHxAQEAwwIAIfIBAQDDAgAhAQAAAJABACABAAAAkAEAIA8FAADFAgAgCQAAxgIAILoBAADBAgAwuwEAAJMBABC8AQAAwQIAML0BAQDCAgAhxAFAAMQCACHSAQEAwwIAIeEBQADEAgAh7QEBAMICACHuAQEAwgIAIe8BAQDDAgAh8AEBAMMCACHxAQEAwwIAIfIBAQDDAgAhBwUAAPcDACAJAAD4AwAg0gEAAPYCACDvAQAA9gIAIPABAAD2AgAg8QEAAPYCACDyAQAA9gIAIAMAAACTAQAgAQAAlAEAMAIAAJABACADAAAAkwEAIAEAAJQBADACAACQAQAgAwAAAJMBACABAACUAQAwAgAAkAEAIAwFAAD1AwAgCQAA9gMAIL0BAQAAAAHEAUAAAAAB0gEBAAAAAeEBQAAAAAHtAQEAAAAB7gEBAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAEBFwAAmAEAIAq9AQEAAAABxAFAAAAAAdIBAQAAAAHhAUAAAAAB7QEBAAAAAe4BAQAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAABARcAAJoBADABFwAAmgEAMAwFAADeAwAgCQAA3wMAIL0BAQD6AgAhxAFAAPwCACHSAQEA-wIAIeEBQAD8AgAh7QEBAPoCACHuAQEA-gIAIe8BAQD7AgAh8AEBAPsCACHxAQEA-wIAIfIBAQD7AgAhAgAAAJABACAXAACdAQAgCr0BAQD6AgAhxAFAAPwCACHSAQEA-wIAIeEBQAD8AgAh7QEBAPoCACHuAQEA-gIAIe8BAQD7AgAh8AEBAPsCACHxAQEA-wIAIfIBAQD7AgAhAgAAAJMBACAXAACfAQAgAgAAAJMBACAXAACfAQAgAwAAAJABACAeAACYAQAgHwAAnQEAIAEAAACQAQAgAQAAAJMBACAIDAAA2wMAICYAAN0DACAnAADcAwAg0gEAAPYCACDvAQAA9gIAIPABAAD2AgAg8QEAAPYCACDyAQAA9gIAIA26AQAAwAIAMLsBAACmAQAQvAEAAMACADC9AQEAnAIAIcQBQACeAgAh0gEBAJ0CACHhAUAAngIAIe0BAQCcAgAh7gEBAJwCACHvAQEAnQIAIfABAQCdAgAh8QEBAJ0CACHyAQEAnQIAIQMAAACTAQAgAQAApQEAMCMAAKYBACADAAAAkwEAIAEAAJQBADACAACQAQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAJBAAA2AMAIAgAANoDACANAADZAwAgvQEBAAAAAb8BAQAAAAHQAQEAAAAB2AEAAADrAQLrAUAAAAAB7AFAAAAAAQEXAACuAQAgBr0BAQAAAAG_AQEAAAAB0AEBAAAAAdgBAAAA6wEC6wFAAAAAAewBQAAAAAEBFwAAsAEAMAEXAACwAQAwCQQAAMwDACAIAADOAwAgDQAAzQMAIL0BAQD6AgAhvwEBAPoCACHQAQEA-gIAIdgBAADLA-sBIusBQAD8AgAh7AFAAIgDACECAAAACQAgFwAAswEAIAa9AQEA-gIAIb8BAQD6AgAh0AEBAPoCACHYAQAAywPrASLrAUAA_AIAIewBQACIAwAhAgAAAAcAIBcAALUBACACAAAABwAgFwAAtQEAIAMAAAAJACAeAACuAQAgHwAAswEAIAEAAAAJACABAAAABwAgBAwAAMgDACAmAADKAwAgJwAAyQMAIOwBAAD2AgAgCboBAAC8AgAwuwEAALwBABC8AQAAvAIAML0BAQCcAgAhvwEBAJwCACHQAQEAnAIAIdgBAAC9AusBIusBQACeAgAh7AFAAKgCACEDAAAABwAgAQAAuwEAMCMAALwBACADAAAABwAgAQAACAAwAgAACQAgAQAAACQAIAEAAAAkACADAAAAGgAgAQAAIwAwAgAAJAAgAwAAABoAIAEAACMAMAIAACQAIAMAAAAaACABAAAjADACAAAkACASBAAAxAMAIAgAAMUDACAJAADGAwAgCwAAxwMAIL0BAQAAAAG_AQEAAAABxAFAAAAAAdMBQAAAAAHYAQAAAOcBAtoBAAAA2gEC4QFAAAAAAeIBQAAAAAHjAQEAAAAB5AEBAAAAAeUBAQAAAAHnAUAAAAAB6AFAAAAAAekBIAAAAAEBFwAAxAEAIA69AQEAAAABvwEBAAAAAcQBQAAAAAHTAUAAAAAB2AEAAADnAQLaAQAAANoBAuEBQAAAAAHiAUAAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5wFAAAAAAegBQAAAAAHpASAAAAABARcAAMYBADABFwAAxgEAMBIEAACcAwAgCAAAnQMAIAkAAJ4DACALAACfAwAgvQEBAPoCACG_AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHYAQAAmwPnASLaAQAAkgPaASLhAUAA_AIAIeIBQAD8AgAh4wEBAPsCACHkAQEA-gIAIeUBAQD7AgAh5wFAAPwCACHoAUAAiAMAIekBIACTAwAhAgAAACQAIBcAAMkBACAOvQEBAPoCACG_AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHYAQAAmwPnASLaAQAAkgPaASLhAUAA_AIAIeIBQAD8AgAh4wEBAPsCACHkAQEA-gIAIeUBAQD7AgAh5wFAAPwCACHoAUAAiAMAIekBIACTAwAhAgAAABoAIBcAAMsBACACAAAAGgAgFwAAywEAIAMAAAAkACAeAADEAQAgHwAAyQEAIAEAAAAkACABAAAAGgAgBgwAAJgDACAmAACaAwAgJwAAmQMAIOMBAAD2AgAg5QEAAPYCACDoAQAA9gIAIBG6AQAAuAIAMLsBAADSAQAQvAEAALgCADC9AQEAnAIAIb8BAQCcAgAhxAFAAJ4CACHTAUAAngIAIdgBAAC5AucBItoBAACwAtoBIuEBQACeAgAh4gFAAJ4CACHjAQEAnQIAIeQBAQCcAgAh5QEBAJ0CACHnAUAAngIAIegBQACoAgAh6QEgALECACEDAAAAGgAgAQAA0QEAMCMAANIBACADAAAAGgAgAQAAIwAwAgAAJAAgAQAAABIAIAEAAAASACADAAAAEAAgAQAAEQAwAgAAEgAgAwAAABAAIAEAABEAMAIAABIAIAMAAAAQACABAAARADACAAASACAQBgAAlgMAIAcAAJcDACC9AQEAAAABwAEBAAAAAcMBAQAAAAHEAUAAAAAB1gEBAAAAAdgBAAAA2AEC2gEAAADaAQLbAQEAAAAB3AFAAAAAAd0BAQAAAAHeASAAAAAB3wEBAAAAAeABAQAAAAHhAUAAAAABARcAANoBACAOvQEBAAAAAcABAQAAAAHDAQEAAAABxAFAAAAAAdYBAQAAAAHYAQAAANgBAtoBAAAA2gEC2wEBAAAAAdwBQAAAAAHdAQEAAAAB3gEgAAAAAd8BAQAAAAHgAQEAAAAB4QFAAAAAAQEXAADcAQAwARcAANwBADAQBgAAlAMAIAcAAJUDACC9AQEA-gIAIcABAQD6AgAhwwEBAPsCACHEAUAA_AIAIdYBAQD6AgAh2AEAAJED2AEi2gEAAJID2gEi2wEBAPoCACHcAUAA_AIAId0BAQD7AgAh3gEgAJMDACHfAQEA-wIAIeABAQD7AgAh4QFAAPwCACECAAAAEgAgFwAA3wEAIA69AQEA-gIAIcABAQD6AgAhwwEBAPsCACHEAUAA_AIAIdYBAQD6AgAh2AEAAJED2AEi2gEAAJID2gEi2wEBAPoCACHcAUAA_AIAId0BAQD7AgAh3gEgAJMDACHfAQEA-wIAIeABAQD7AgAh4QFAAPwCACECAAAAEAAgFwAA4QEAIAIAAAAQACAXAADhAQAgAwAAABIAIB4AANoBACAfAADfAQAgAQAAABIAIAEAAAAQACAHDAAAjgMAICYAAJADACAnAACPAwAgwwEAAPYCACDdAQAA9gIAIN8BAAD2AgAg4AEAAPYCACARugEAAK4CADC7AQAA6AEAELwBAACuAgAwvQEBAJwCACHAAQEAnAIAIcMBAQCdAgAhxAFAAJ4CACHWAQEAnAIAIdgBAACvAtgBItoBAACwAtoBItsBAQCcAgAh3AFAAJ4CACHdAQEAnQIAId4BIACxAgAh3wEBAJ0CACHgAQEAnQIAIeEBQACeAgAhAwAAABAAIAEAAOcBADAjAADoAQAgAwAAABAAIAEAABEAMAIAABIAIAEAAAAOACABAAAADgAgAwAAAAwAIAEAAA0AMAIAAA4AIAMAAAAMACABAAANADACAAAOACADAAAADAAgAQAADQAwAgAADgAgCwYAAIwDACANAACNAwAgvQEBAAAAAcABAQAAAAHEAUAAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB0wFAAAAAAdQBQAAAAAHVAQIAAAABARcAAPABACAJvQEBAAAAAcABAQAAAAHEAUAAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB0wFAAAAAAdQBQAAAAAHVAQIAAAABARcAAPIBADABFwAA8gEAMAsGAACKAwAgDQAAiwMAIL0BAQD6AgAhwAEBAPoCACHEAUAA_AIAIdABAQD6AgAh0QEBAPoCACHSAQEA-gIAIdMBQAD8AgAh1AFAAIgDACHVAQIAiQMAIQIAAAAOACAXAAD1AQAgCb0BAQD6AgAhwAEBAPoCACHEAUAA_AIAIdABAQD6AgAh0QEBAPoCACHSAQEA-gIAIdMBQAD8AgAh1AFAAIgDACHVAQIAiQMAIQIAAAAMACAXAAD3AQAgAgAAAAwAIBcAAPcBACADAAAADgAgHgAA8AEAIB8AAPUBACABAAAADgAgAQAAAAwAIAYMAACDAwAgJAAAhAMAICUAAIcDACAmAACGAwAgJwAAhQMAINQBAAD2AgAgDLoBAACnAgAwuwEAAP4BABC8AQAApwIAML0BAQCcAgAhwAEBAJwCACHEAUAAngIAIdABAQCcAgAh0QEBAJwCACHSAQEAnAIAIdMBQACeAgAh1AFAAKgCACHVAQIAqQIAIQMAAAAMACABAAD9AQAwIwAA_gEAIAMAAAAMACABAAANADACAAAOACABAAAAFwAgAQAAABcAIAMAAAAVACABAAAWADACAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgAwAAABUAIAEAABYAMAIAABcAIAsEAACBAwAgBgAAggMAIAoAAIADACC9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAAAABwQEBAAAAAcIBAQAAAAHDAQEAAAABxAFAAAAAAQEXAACGAgAgCL0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQAAAAHBAQEAAAABwgEBAAAAAcMBAQAAAAHEAUAAAAABARcAAIgCADABFwAAiAIAMAEAAAADACABAAAAGgAgCwQAAP4CACAGAAD_AgAgCgAA_QIAIL0BAQD6AgAhvgEBAPoCACG_AQEA-wIAIcABAQD7AgAhwQEBAPoCACHCAQEA-gIAIcMBAQD7AgAhxAFAAPwCACECAAAAFwAgFwAAjQIAIAi9AQEA-gIAIb4BAQD6AgAhvwEBAPsCACHAAQEA-wIAIcEBAQD6AgAhwgEBAPoCACHDAQEA-wIAIcQBQAD8AgAhAgAAABUAIBcAAI8CACACAAAAFQAgFwAAjwIAIAEAAAADACABAAAAGgAgAwAAABcAIB4AAIYCACAfAACNAgAgAQAAABcAIAEAAAAVACAGDAAA9wIAICYAAPkCACAnAAD4AgAgvwEAAPYCACDAAQAA9gIAIMMBAAD2AgAgC7oBAACbAgAwuwEAAJgCABC8AQAAmwIAML0BAQCcAgAhvgEBAJwCACG_AQEAnQIAIcABAQCdAgAhwQEBAJwCACHCAQEAnAIAIcMBAQCdAgAhxAFAAJ4CACEDAAAAFQAgAQAAlwIAMCMAAJgCACADAAAAFQAgAQAAFgAwAgAAFwAgC7oBAACbAgAwuwEAAJgCABC8AQAAmwIAML0BAQCcAgAhvgEBAJwCACG_AQEAnQIAIcABAQCdAgAhwQEBAJwCACHCAQEAnAIAIcMBAQCdAgAhxAFAAJ4CACEODAAAoAIAICYAAKYCACAnAACmAgAgxQEBAAAAAcYBAQAAAATHAQEAAAAEyAEBAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAcwBAQClAgAhzQEBAAAAAc4BAQAAAAHPAQEAAAABDgwAAKMCACAmAACkAgAgJwAApAIAIMUBAQAAAAHGAQEAAAAFxwEBAAAABcgBAQAAAAHJAQEAAAABygEBAAAAAcsBAQAAAAHMAQEAogIAIc0BAQAAAAHOAQEAAAABzwEBAAAAAQsMAACgAgAgJgAAoQIAICcAAKECACDFAUAAAAABxgFAAAAABMcBQAAAAATIAUAAAAAByQFAAAAAAcoBQAAAAAHLAUAAAAABzAFAAJ8CACELDAAAoAIAICYAAKECACAnAAChAgAgxQFAAAAAAcYBQAAAAATHAUAAAAAEyAFAAAAAAckBQAAAAAHKAUAAAAABywFAAAAAAcwBQACfAgAhCMUBAgAAAAHGAQIAAAAExwECAAAABMgBAgAAAAHJAQIAAAABygECAAAAAcsBAgAAAAHMAQIAoAIAIQjFAUAAAAABxgFAAAAABMcBQAAAAATIAUAAAAAByQFAAAAAAcoBQAAAAAHLAUAAAAABzAFAAKECACEODAAAowIAICYAAKQCACAnAACkAgAgxQEBAAAAAcYBAQAAAAXHAQEAAAAFyAEBAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAcwBAQCiAgAhzQEBAAAAAc4BAQAAAAHPAQEAAAABCMUBAgAAAAHGAQIAAAAFxwECAAAABcgBAgAAAAHJAQIAAAABygECAAAAAcsBAgAAAAHMAQIAowIAIQvFAQEAAAABxgEBAAAABccBAQAAAAXIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEAAAABzAEBAKQCACHNAQEAAAABzgEBAAAAAc8BAQAAAAEODAAAoAIAICYAAKYCACAnAACmAgAgxQEBAAAAAcYBAQAAAATHAQEAAAAEyAEBAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAcwBAQClAgAhzQEBAAAAAc4BAQAAAAHPAQEAAAABC8UBAQAAAAHGAQEAAAAExwEBAAAABMgBAQAAAAHJAQEAAAABygEBAAAAAcsBAQAAAAHMAQEApgIAIc0BAQAAAAHOAQEAAAABzwEBAAAAAQy6AQAApwIAMLsBAAD-AQAQvAEAAKcCADC9AQEAnAIAIcABAQCcAgAhxAFAAJ4CACHQAQEAnAIAIdEBAQCcAgAh0gEBAJwCACHTAUAAngIAIdQBQACoAgAh1QECAKkCACELDAAAowIAICYAAK0CACAnAACtAgAgxQFAAAAAAcYBQAAAAAXHAUAAAAAFyAFAAAAAAckBQAAAAAHKAUAAAAABywFAAAAAAcwBQACsAgAhDQwAAKACACAkAACrAgAgJQAAoAIAICYAAKACACAnAACgAgAgxQECAAAAAcYBAgAAAATHAQIAAAAEyAECAAAAAckBAgAAAAHKAQIAAAABywECAAAAAcwBAgCqAgAhDQwAAKACACAkAACrAgAgJQAAoAIAICYAAKACACAnAACgAgAgxQECAAAAAcYBAgAAAATHAQIAAAAEyAECAAAAAckBAgAAAAHKAQIAAAABywECAAAAAcwBAgCqAgAhCMUBCAAAAAHGAQgAAAAExwEIAAAABMgBCAAAAAHJAQgAAAABygEIAAAAAcsBCAAAAAHMAQgAqwIAIQsMAACjAgAgJgAArQIAICcAAK0CACDFAUAAAAABxgFAAAAABccBQAAAAAXIAUAAAAAByQFAAAAAAcoBQAAAAAHLAUAAAAABzAFAAKwCACEIxQFAAAAAAcYBQAAAAAXHAUAAAAAFyAFAAAAAAckBQAAAAAHKAUAAAAABywFAAAAAAcwBQACtAgAhEboBAACuAgAwuwEAAOgBABC8AQAArgIAML0BAQCcAgAhwAEBAJwCACHDAQEAnQIAIcQBQACeAgAh1gEBAJwCACHYAQAArwLYASLaAQAAsALaASLbAQEAnAIAIdwBQACeAgAh3QEBAJ0CACHeASAAsQIAId8BAQCdAgAh4AEBAJ0CACHhAUAAngIAIQcMAACgAgAgJgAAtwIAICcAALcCACDFAQAAANgBAsYBAAAA2AEIxwEAAADYAQjMAQAAtgLYASIHDAAAoAIAICYAALUCACAnAAC1AgAgxQEAAADaAQLGAQAAANoBCMcBAAAA2gEIzAEAALQC2gEiBQwAAKACACAmAACzAgAgJwAAswIAIMUBIAAAAAHMASAAsgIAIQUMAACgAgAgJgAAswIAICcAALMCACDFASAAAAABzAEgALICACECxQEgAAAAAcwBIACzAgAhBwwAAKACACAmAAC1AgAgJwAAtQIAIMUBAAAA2gECxgEAAADaAQjHAQAAANoBCMwBAAC0AtoBIgTFAQAAANoBAsYBAAAA2gEIxwEAAADaAQjMAQAAtQLaASIHDAAAoAIAICYAALcCACAnAAC3AgAgxQEAAADYAQLGAQAAANgBCMcBAAAA2AEIzAEAALYC2AEiBMUBAAAA2AECxgEAAADYAQjHAQAAANgBCMwBAAC3AtgBIhG6AQAAuAIAMLsBAADSAQAQvAEAALgCADC9AQEAnAIAIb8BAQCcAgAhxAFAAJ4CACHTAUAAngIAIdgBAAC5AucBItoBAACwAtoBIuEBQACeAgAh4gFAAJ4CACHjAQEAnQIAIeQBAQCcAgAh5QEBAJ0CACHnAUAAngIAIegBQACoAgAh6QEgALECACEHDAAAoAIAICYAALsCACAnAAC7AgAgxQEAAADnAQLGAQAAAOcBCMcBAAAA5wEIzAEAALoC5wEiBwwAAKACACAmAAC7AgAgJwAAuwIAIMUBAAAA5wECxgEAAADnAQjHAQAAAOcBCMwBAAC6AucBIgTFAQAAAOcBAsYBAAAA5wEIxwEAAADnAQjMAQAAuwLnASIJugEAALwCADC7AQAAvAEAELwBAAC8AgAwvQEBAJwCACG_AQEAnAIAIdABAQCcAgAh2AEAAL0C6wEi6wFAAJ4CACHsAUAAqAIAIQcMAACgAgAgJgAAvwIAICcAAL8CACDFAQAAAOsBAsYBAAAA6wEIxwEAAADrAQjMAQAAvgLrASIHDAAAoAIAICYAAL8CACAnAAC_AgAgxQEAAADrAQLGAQAAAOsBCMcBAAAA6wEIzAEAAL4C6wEiBMUBAAAA6wECxgEAAADrAQjHAQAAAOsBCMwBAAC_AusBIg26AQAAwAIAMLsBAACmAQAQvAEAAMACADC9AQEAnAIAIcQBQACeAgAh0gEBAJ0CACHhAUAAngIAIe0BAQCcAgAh7gEBAJwCACHvAQEAnQIAIfABAQCdAgAh8QEBAJ0CACHyAQEAnQIAIQ8FAADFAgAgCQAAxgIAILoBAADBAgAwuwEAAJMBABC8AQAAwQIAML0BAQDCAgAhxAFAAMQCACHSAQEAwwIAIeEBQADEAgAh7QEBAMICACHuAQEAwgIAIe8BAQDDAgAh8AEBAMMCACHxAQEAwwIAIfIBAQDDAgAhC8UBAQAAAAHGAQEAAAAExwEBAAAABMgBAQAAAAHJAQEAAAABygEBAAAAAcsBAQAAAAHMAQEApgIAIc0BAQAAAAHOAQEAAAABzwEBAAAAAQvFAQEAAAABxgEBAAAABccBAQAAAAXIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEAAAABzAEBAKQCACHNAQEAAAABzgEBAAAAAc8BAQAAAAEIxQFAAAAAAcYBQAAAAATHAUAAAAAEyAFAAAAAAckBQAAAAAHKAUAAAAABywFAAAAAAcwBQAChAgAhA_MBAAAHACD0AQAABwAg9QEAAAcAIAPzAQAADAAg9AEAAAwAIPUBAAAMACASBgEAnAIAIboBAADHAgAwuwEAAI0BABC8AQAAxwIAML0BAQCcAgAhxAFAAJ4CACHYAQAAygL_ASLhAUAAngIAIe8BAQCdAgAh8AEBAJ0CACH2AQEAnAIAIfcBAQCcAgAh-AEBAJwCACH5AQEAnAIAIfoBAQCdAgAh-wEBAJ0CACH8AQIAyAIAIf0BCADJAgAhDQwAAKMCACAkAADPAgAgJQAAowIAICYAAKMCACAnAACjAgAgxQECAAAAAcYBAgAAAAXHAQIAAAAFyAECAAAAAckBAgAAAAHKAQIAAAABywECAAAAAcwBAgDOAgAhDQwAAKACACAkAACrAgAgJQAAqwIAICYAAKsCACAnAACrAgAgxQEIAAAAAcYBCAAAAATHAQgAAAAEyAEIAAAAAckBCAAAAAHKAQgAAAABywEIAAAAAcwBCADNAgAhBwwAAKACACAmAADMAgAgJwAAzAIAIMUBAAAA_wECxgEAAAD_AQjHAQAAAP8BCMwBAADLAv8BIgcMAACgAgAgJgAAzAIAICcAAMwCACDFAQAAAP8BAsYBAAAA_wEIxwEAAAD_AQjMAQAAywL_ASIExQEAAAD_AQLGAQAAAP8BCMcBAAAA_wEIzAEAAMwC_wEiDQwAAKACACAkAACrAgAgJQAAqwIAICYAAKsCACAnAACrAgAgxQEIAAAAAcYBCAAAAATHAQgAAAAEyAEIAAAAAckBCAAAAAHKAQgAAAABywEIAAAAAcwBCADNAgAhDQwAAKMCACAkAADPAgAgJQAAowIAICYAAKMCACAnAACjAgAgxQECAAAAAcYBAgAAAAXHAQIAAAAFyAECAAAAAckBAgAAAAHKAQIAAAABywECAAAAAcwBAgDOAgAhCMUBCAAAAAHGAQgAAAAFxwEIAAAABcgBCAAAAAHJAQgAAAABygEIAAAAAcsBCAAAAAHMAQgAzwIAIQm6AQAA0AIAMLsBAAB3ABC8AQAA0AIAML0BAQCcAgAhvgEBAJwCACHEAUAAngIAIdMBQACeAgAh5AEBAJwCACH_AUAAqAIAIQi6AQAA0QIAMLsBAABhABC8AQAA0QIAML0BAQCcAgAhvgEBAJwCACHEAUAAngIAIdMBQACeAgAh5AEBAJwCACEQugEAANICADC7AQAASwAQvAEAANICADC9AQEAnAIAIcQBQACeAgAh0gEBAJwCACHhAUAAngIAIe4BAQCcAgAh7wEBAJ0CACGAAgEAnAIAIYECAQCdAgAhggIgALECACGDAgEAnAIAIYQCCADJAgAhhQICAKkCACGGAgAAsALaASIUCwAA2wIAIA8AANgCACAQAADZAgAgEQAA2gIAILoBAADTAgAwuwEAADgAELwBAADTAgAwvQEBAMICACHEAUAAxAIAIdIBAQDCAgAh4QFAAMQCACHuAQEAwgIAIe8BAQDDAgAhgAIBAMICACGBAgEAwwIAIYICIADUAgAhgwIBAMICACGEAggA1QIAIYUCAgDWAgAhhgIAANcC2gEiAsUBIAAAAAHMASAAswIAIQjFAQgAAAABxgEIAAAABMcBCAAAAATIAQgAAAAByQEIAAAAAcoBCAAAAAHLAQgAAAABzAEIAKsCACEIxQECAAAAAcYBAgAAAATHAQIAAAAEyAECAAAAAckBAgAAAAHKAQIAAAABywECAAAAAcwBAgCgAgAhBMUBAAAA2gECxgEAAADaAQjHAQAAANoBCMwBAAC1AtoBIgPzAQAAAwAg9AEAAAMAIPUBAAADACAD8wEAACoAIPQBAAAqACD1AQAAKgAgA_MBAAAuACD0AQAALgAg9QEAAC4AIAPzAQAAFQAg9AEAABUAIPUBAAAVACAKCgAA3gIAILoBAADcAgAwuwEAAC4AELwBAADcAgAwvQEBAMICACG-AQEAwgIAIcQBQADEAgAh0wFAAMQCACHkAQEAwgIAIf8BQADdAgAhCMUBQAAAAAHGAUAAAAAFxwFAAAAABcgBQAAAAAHJAUAAAAABygFAAAAAAcsBQAAAAAHMAUAArQIAIRYLAADbAgAgDwAA2AIAIBAAANkCACARAADaAgAgugEAANMCADC7AQAAOAAQvAEAANMCADC9AQEAwgIAIcQBQADEAgAh0gEBAMICACHhAUAAxAIAIe4BAQDCAgAh7wEBAMMCACGAAgEAwgIAIYECAQDDAgAhggIgANQCACGDAgEAwgIAIYQCCADVAgAhhQICANYCACGGAgAA1wLaASKKAgAAOAAgiwIAADgAIAkKAADeAgAgugEAAN8CADC7AQAAKgAQvAEAAN8CADC9AQEAwgIAIb4BAQDCAgAhxAFAAMQCACHTAUAAxAIAIeQBAQDCAgAhFQQAAOICACAIAADjAgAgCQAAxgIAIAsAANsCACC6AQAA4AIAMLsBAAAaABC8AQAA4AIAML0BAQDCAgAhvwEBAMICACHEAUAAxAIAIdMBQADEAgAh2AEAAOEC5wEi2gEAANcC2gEi4QFAAMQCACHiAUAAxAIAIeMBAQDDAgAh5AEBAMICACHlAQEAwwIAIecBQADEAgAh6AFAAN0CACHpASAA1AIAIQTFAQAAAOcBAsYBAAAA5wEIxwEAAADnAQjMAQAAuwLnASIYAwAA3gIAIAUAAMUCACAGAQDCAgAhCwAA2wIAIA4AAPUCACC6AQAA8gIAMLsBAAADABC8AQAA8gIAML0BAQDCAgAhxAFAAMQCACHYAQAA9AL_ASLhAUAAxAIAIe8BAQDDAgAh8AEBAMMCACH2AQEAwgIAIfcBAQDCAgAh-AEBAMICACH5AQEAwgIAIfoBAQDDAgAh-wEBAMMCACH8AQIA8wIAIf0BCADVAgAhigIAAAMAIIsCAAADACAD8wEAABAAIPQBAAAQACD1AQAAEAAgDgQAAOUCACAGAADmAgAgCgAA3gIAILoBAADkAgAwuwEAABUAELwBAADkAgAwvQEBAMICACG-AQEAwgIAIb8BAQDDAgAhwAEBAMMCACHBAQEAwgIAIcIBAQDCAgAhwwEBAMMCACHEAUAAxAIAIRgDAADeAgAgBQAAxQIAIAYBAMICACELAADbAgAgDgAA9QIAILoBAADyAgAwuwEAAAMAELwBAADyAgAwvQEBAMICACHEAUAAxAIAIdgBAAD0Av8BIuEBQADEAgAh7wEBAMMCACHwAQEAwwIAIfYBAQDCAgAh9wEBAMICACH4AQEAwgIAIfkBAQDCAgAh-gEBAMMCACH7AQEAwwIAIfwBAgDzAgAh_QEIANUCACGKAgAAAwAgiwIAAAMAIBcEAADiAgAgCAAA4wIAIAkAAMYCACALAADbAgAgugEAAOACADC7AQAAGgAQvAEAAOACADC9AQEAwgIAIb8BAQDCAgAhxAFAAMQCACHTAUAAxAIAIdgBAADhAucBItoBAADXAtoBIuEBQADEAgAh4gFAAMQCACHjAQEAwwIAIeQBAQDCAgAh5QEBAMMCACHnAUAAxAIAIegBQADdAgAh6QEgANQCACGKAgAAGgAgiwIAABoAIALAAQEAAAAB1gEBAAAAARMGAADqAgAgBwAA6wIAILoBAADoAgAwuwEAABAAELwBAADoAgAwvQEBAMICACHAAQEAwgIAIcMBAQDDAgAhxAFAAMQCACHWAQEAwgIAIdgBAADpAtgBItoBAADXAtoBItsBAQDCAgAh3AFAAMQCACHdAQEAwwIAId4BIADUAgAh3wEBAMMCACHgAQEAwwIAIeEBQADEAgAhBMUBAAAA2AECxgEAAADYAQjHAQAAANgBCMwBAAC3AtgBIhcEAADiAgAgCAAA4wIAIAkAAMYCACALAADbAgAgugEAAOACADC7AQAAGgAQvAEAAOACADC9AQEAwgIAIb8BAQDCAgAhxAFAAMQCACHTAUAAxAIAIdgBAADhAucBItoBAADXAtoBIuEBQADEAgAh4gFAAMQCACHjAQEAwwIAIeQBAQDCAgAh5QEBAMMCACHnAUAAxAIAIegBQADdAgAh6QEgANQCACGKAgAAGgAgiwIAABoAIA4EAADiAgAgCAAA4wIAIA0AAO0CACC6AQAA7wIAMLsBAAAHABC8AQAA7wIAML0BAQDCAgAhvwEBAMICACHQAQEAwgIAIdgBAADwAusBIusBQADEAgAh7AFAAN0CACGKAgAABwAgiwIAAAcAIA4GAADqAgAgDQAA7QIAILoBAADsAgAwuwEAAAwAELwBAADsAgAwvQEBAMICACHAAQEAwgIAIcQBQADEAgAh0AEBAMICACHRAQEAwgIAIdIBAQDCAgAh0wFAAMQCACHUAUAA3QIAIdUBAgDWAgAhEQUAAMUCACAJAADGAgAgugEAAMECADC7AQAAkwEAELwBAADBAgAwvQEBAMICACHEAUAAxAIAIdIBAQDDAgAh4QFAAMQCACHtAQEAwgIAIe4BAQDCAgAh7wEBAMMCACHwAQEAwwIAIfEBAQDDAgAh8gEBAMMCACGKAgAAkwEAIIsCAACTAQAgAr8BAQAAAAHQAQEAAAABDAQAAOICACAIAADjAgAgDQAA7QIAILoBAADvAgAwuwEAAAcAELwBAADvAgAwvQEBAMICACG_AQEAwgIAIdABAQDCAgAh2AEAAPAC6wEi6wFAAMQCACHsAUAA3QIAIQTFAQAAAOsBAsYBAAAA6wEIxwEAAADrAQjMAQAAvwLrASIEBgEAAAAB9gEBAAAAAfcBAQAAAAH5AQEAAAABFgMAAN4CACAFAADFAgAgBgEAwgIAIQsAANsCACAOAAD1AgAgugEAAPICADC7AQAAAwAQvAEAAPICADC9AQEAwgIAIcQBQADEAgAh2AEAAPQC_wEi4QFAAMQCACHvAQEAwwIAIfABAQDDAgAh9gEBAMICACH3AQEAwgIAIfgBAQDCAgAh-QEBAMICACH6AQEAwwIAIfsBAQDDAgAh_AECAPMCACH9AQgA1QIAIQjFAQIAAAABxgECAAAABccBAgAAAAXIAQIAAAAByQECAAAAAcoBAgAAAAHLAQIAAAABzAECAKMCACEExQEAAAD_AQLGAQAAAP8BCMcBAAAA_wEIzAEAAMwC_wEiA_MBAAAaACD0AQAAGgAg9QEAABoAIAAAAAABjwIBAAAAAQGPAgEAAAABAY8CQAAAAAEFHgAAuQUAIB8AAMIFACCMAgAAugUAII0CAADBBQAgkgIAAAEAIAceAAC3BQAgHwAAvwUAIIwCAAC4BQAgjQIAAL4FACCQAgAAAwAgkQIAAAMAIJICAAAFACAHHgAAtQUAIB8AALwFACCMAgAAtgUAII0CAAC7BQAgkAIAABoAIJECAAAaACCSAgAAJAAgAx4AALkFACCMAgAAugUAIJICAAABACADHgAAtwUAIIwCAAC4BQAgkgIAAAUAIAMeAAC1BQAgjAIAALYFACCSAgAAJAAgAAAAAAABjwJAAAAAAQWPAgIAAAABlQICAAAAAZYCAgAAAAGXAgIAAAABmAICAAAAAQUeAACtBQAgHwAAswUAIIwCAACuBQAgjQIAALIFACCSAgAAJAAgBR4AAKsFACAfAACwBQAgjAIAAKwFACCNAgAArwUAIJICAACQAQAgAx4AAK0FACCMAgAArgUAIJICAAAkACADHgAAqwUAIIwCAACsBQAgkgIAAJABACAAAAABjwIAAADYAQIBjwIAAADaAQIBjwIgAAAAAQUeAACjBQAgHwAAqQUAIIwCAACkBQAgjQIAAKgFACCSAgAAJAAgBR4AAKEFACAfAACmBQAgjAIAAKIFACCNAgAApQUAIJICAAAJACADHgAAowUAIIwCAACkBQAgkgIAACQAIAMeAAChBQAgjAIAAKIFACCSAgAACQAgAAAAAY8CAAAA5wECBR4AAJkFACAfAACfBQAgjAIAAJoFACCNAgAAngUAIJICAAAFACALHgAAuAMAMB8AAL0DADCMAgAAuQMAMI0CAAC6AwAwjgIAALsDACCPAgAAvAMAMJACAAC8AwAwkQIAALwDADCSAgAAvAMAMJMCAAC-AwAwlAIAAL8DADALHgAArAMAMB8AALEDADCMAgAArQMAMI0CAACuAwAwjgIAAK8DACCPAgAAsAMAMJACAACwAwAwkQIAALADADCSAgAAsAMAMJMCAACyAwAwlAIAALMDADALHgAAoAMAMB8AAKUDADCMAgAAoQMAMI0CAACiAwAwjgIAAKMDACCPAgAApAMAMJACAACkAwAwkQIAAKQDADCSAgAApAMAMJMCAACmAwAwlAIAAKcDADAJBAAAgQMAIAoAAIADACC9AQEAAAABvgEBAAAAAb8BAQAAAAHBAQEAAAABwgEBAAAAAcMBAQAAAAHEAUAAAAABAgAAABcAIB4AAKsDACADAAAAFwAgHgAAqwMAIB8AAKoDACABFwAAnQUAMA4EAADlAgAgBgAA5gIAIAoAAN4CACC6AQAA5AIAMLsBAAAVABC8AQAA5AIAML0BAQAAAAG-AQEAwgIAIb8BAQDDAgAhwAEBAMMCACHBAQEAwgIAIcIBAQDCAgAhwwEBAMMCACHEAUAAxAIAIQIAAAAXACAXAACqAwAgAgAAAKgDACAXAACpAwAgC7oBAACnAwAwuwEAAKgDABC8AQAApwMAML0BAQDCAgAhvgEBAMICACG_AQEAwwIAIcABAQDDAgAhwQEBAMICACHCAQEAwgIAIcMBAQDDAgAhxAFAAMQCACELugEAAKcDADC7AQAAqAMAELwBAACnAwAwvQEBAMICACG-AQEAwgIAIb8BAQDDAgAhwAEBAMMCACHBAQEAwgIAIcIBAQDCAgAhwwEBAMMCACHEAUAAxAIAIQe9AQEA-gIAIb4BAQD6AgAhvwEBAPsCACHBAQEA-gIAIcIBAQD6AgAhwwEBAPsCACHEAUAA_AIAIQkEAAD-AgAgCgAA_QIAIL0BAQD6AgAhvgEBAPoCACG_AQEA-wIAIcEBAQD6AgAhwgEBAPoCACHDAQEA-wIAIcQBQAD8AgAhCQQAAIEDACAKAACAAwAgvQEBAAAAAb4BAQAAAAG_AQEAAAABwQEBAAAAAcIBAQAAAAHDAQEAAAABxAFAAAAAAQkNAACNAwAgvQEBAAAAAcQBQAAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAUAAAAAB1AFAAAAAAdUBAgAAAAECAAAADgAgHgAAtwMAIAMAAAAOACAeAAC3AwAgHwAAtgMAIAEXAACcBQAwDgYAAOoCACANAADtAgAgugEAAOwCADC7AQAADAAQvAEAAOwCADC9AQEAAAABwAEBAMICACHEAUAAxAIAIdABAQDCAgAh0QEBAMICACHSAQEAwgIAIdMBQADEAgAh1AFAAN0CACHVAQIA1gIAIQIAAAAOACAXAAC2AwAgAgAAALQDACAXAAC1AwAgDLoBAACzAwAwuwEAALQDABC8AQAAswMAML0BAQDCAgAhwAEBAMICACHEAUAAxAIAIdABAQDCAgAh0QEBAMICACHSAQEAwgIAIdMBQADEAgAh1AFAAN0CACHVAQIA1gIAIQy6AQAAswMAMLsBAAC0AwAQvAEAALMDADC9AQEAwgIAIcABAQDCAgAhxAFAAMQCACHQAQEAwgIAIdEBAQDCAgAh0gEBAMICACHTAUAAxAIAIdQBQADdAgAh1QECANYCACEIvQEBAPoCACHEAUAA_AIAIdABAQD6AgAh0QEBAPoCACHSAQEA-gIAIdMBQAD8AgAh1AFAAIgDACHVAQIAiQMAIQkNAACLAwAgvQEBAPoCACHEAUAA_AIAIdABAQD6AgAh0QEBAPoCACHSAQEA-gIAIdMBQAD8AgAh1AFAAIgDACHVAQIAiQMAIQkNAACNAwAgvQEBAAAAAcQBQAAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAUAAAAAB1AFAAAAAAdUBAgAAAAEOBwAAlwMAIL0BAQAAAAHDAQEAAAABxAFAAAAAAdYBAQAAAAHYAQAAANgBAtoBAAAA2gEC2wEBAAAAAdwBQAAAAAHdAQEAAAAB3gEgAAAAAd8BAQAAAAHgAQEAAAAB4QFAAAAAAQIAAAASACAeAADDAwAgAwAAABIAIB4AAMMDACAfAADCAwAgARcAAJsFADAUBgAA6gIAIAcAAOsCACC6AQAA6AIAMLsBAAAQABC8AQAA6AIAML0BAQAAAAHAAQEAwgIAIcMBAQDDAgAhxAFAAMQCACHWAQEAwgIAIdgBAADpAtgBItoBAADXAtoBItsBAQDCAgAh3AFAAMQCACHdAQEAwwIAId4BIADUAgAh3wEBAMMCACHgAQEAwwIAIeEBQADEAgAhhwIAAOcCACACAAAAEgAgFwAAwgMAIAIAAADAAwAgFwAAwQMAIBG6AQAAvwMAMLsBAADAAwAQvAEAAL8DADC9AQEAwgIAIcABAQDCAgAhwwEBAMMCACHEAUAAxAIAIdYBAQDCAgAh2AEAAOkC2AEi2gEAANcC2gEi2wEBAMICACHcAUAAxAIAId0BAQDDAgAh3gEgANQCACHfAQEAwwIAIeABAQDDAgAh4QFAAMQCACERugEAAL8DADC7AQAAwAMAELwBAAC_AwAwvQEBAMICACHAAQEAwgIAIcMBAQDDAgAhxAFAAMQCACHWAQEAwgIAIdgBAADpAtgBItoBAADXAtoBItsBAQDCAgAh3AFAAMQCACHdAQEAwwIAId4BIADUAgAh3wEBAMMCACHgAQEAwwIAIeEBQADEAgAhDb0BAQD6AgAhwwEBAPsCACHEAUAA_AIAIdYBAQD6AgAh2AEAAJED2AEi2gEAAJID2gEi2wEBAPoCACHcAUAA_AIAId0BAQD7AgAh3gEgAJMDACHfAQEA-wIAIeABAQD7AgAh4QFAAPwCACEOBwAAlQMAIL0BAQD6AgAhwwEBAPsCACHEAUAA_AIAIdYBAQD6AgAh2AEAAJED2AEi2gEAAJID2gEi2wEBAPoCACHcAUAA_AIAId0BAQD7AgAh3gEgAJMDACHfAQEA-wIAIeABAQD7AgAh4QFAAPwCACEOBwAAlwMAIL0BAQAAAAHDAQEAAAABxAFAAAAAAdYBAQAAAAHYAQAAANgBAtoBAAAA2gEC2wEBAAAAAdwBQAAAAAHdAQEAAAAB3gEgAAAAAd8BAQAAAAHgAQEAAAAB4QFAAAAAAQMeAACZBQAgjAIAAJoFACCSAgAABQAgBB4AALgDADCMAgAAuQMAMI4CAAC7AwAgkgIAALwDADAEHgAArAMAMIwCAACtAwAwjgIAAK8DACCSAgAAsAMAMAQeAACgAwAwjAIAAKEDADCOAgAAowMAIJICAACkAwAwAAAAAY8CAAAA6wECBR4AAJAFACAfAACXBQAgjAIAAJEFACCNAgAAlgUAIJICAAAFACAFHgAAjgUAIB8AAJQFACCMAgAAjwUAII0CAACTBQAgkgIAAJABACALHgAAzwMAMB8AANMDADCMAgAA0AMAMI0CAADRAwAwjgIAANIDACCPAgAAvAMAMJACAAC8AwAwkQIAALwDADCSAgAAvAMAMJMCAADUAwAwlAIAAL8DADAOBgAAlgMAIL0BAQAAAAHAAQEAAAABwwEBAAAAAcQBQAAAAAHYAQAAANgBAtoBAAAA2gEC2wEBAAAAAdwBQAAAAAHdAQEAAAAB3gEgAAAAAd8BAQAAAAHgAQEAAAAB4QFAAAAAAQIAAAASACAeAADXAwAgAwAAABIAIB4AANcDACAfAADWAwAgARcAAJIFADACAAAAEgAgFwAA1gMAIAIAAADAAwAgFwAA1QMAIA29AQEA-gIAIcABAQD6AgAhwwEBAPsCACHEAUAA_AIAIdgBAACRA9gBItoBAACSA9oBItsBAQD6AgAh3AFAAPwCACHdAQEA-wIAId4BIACTAwAh3wEBAPsCACHgAQEA-wIAIeEBQAD8AgAhDgYAAJQDACC9AQEA-gIAIcABAQD6AgAhwwEBAPsCACHEAUAA_AIAIdgBAACRA9gBItoBAACSA9oBItsBAQD6AgAh3AFAAPwCACHdAQEA-wIAId4BIACTAwAh3wEBAPsCACHgAQEA-wIAIeEBQAD8AgAhDgYAAJYDACC9AQEAAAABwAEBAAAAAcMBAQAAAAHEAUAAAAAB2AEAAADYAQLaAQAAANoBAtsBAQAAAAHcAUAAAAAB3QEBAAAAAd4BIAAAAAHfAQEAAAAB4AEBAAAAAeEBQAAAAAEDHgAAkAUAIIwCAACRBQAgkgIAAAUAIAMeAACOBQAgjAIAAI8FACCSAgAAkAEAIAQeAADPAwAwjAIAANADADCOAgAA0gMAIJICAAC8AwAwAAAACx4AAOkDADAfAADuAwAwjAIAAOoDADCNAgAA6wMAMI4CAADsAwAgjwIAAO0DADCQAgAA7QMAMJECAADtAwAwkgIAAO0DADCTAgAA7wMAMJQCAADwAwAwCx4AAOADADAfAADkAwAwjAIAAOEDADCNAgAA4gMAMI4CAADjAwAgjwIAALADADCQAgAAsAMAMJECAACwAwAwkgIAALADADCTAgAA5QMAMJQCAACzAwAwCQYAAIwDACC9AQEAAAABwAEBAAAAAcQBQAAAAAHRAQEAAAAB0gEBAAAAAdMBQAAAAAHUAUAAAAAB1QECAAAAAQIAAAAOACAeAADoAwAgAwAAAA4AIB4AAOgDACAfAADnAwAgARcAAI0FADACAAAADgAgFwAA5wMAIAIAAAC0AwAgFwAA5gMAIAi9AQEA-gIAIcABAQD6AgAhxAFAAPwCACHRAQEA-gIAIdIBAQD6AgAh0wFAAPwCACHUAUAAiAMAIdUBAgCJAwAhCQYAAIoDACC9AQEA-gIAIcABAQD6AgAhxAFAAPwCACHRAQEA-gIAIdIBAQD6AgAh0wFAAPwCACHUAUAAiAMAIdUBAgCJAwAhCQYAAIwDACC9AQEAAAABwAEBAAAAAcQBQAAAAAHRAQEAAAAB0gEBAAAAAdMBQAAAAAHUAUAAAAAB1QECAAAAAQcEAADYAwAgCAAA2gMAIL0BAQAAAAG_AQEAAAAB2AEAAADrAQLrAUAAAAAB7AFAAAAAAQIAAAAJACAeAAD0AwAgAwAAAAkAIB4AAPQDACAfAADzAwAgARcAAIwFADANBAAA4gIAIAgAAOMCACANAADtAgAgugEAAO8CADC7AQAABwAQvAEAAO8CADC9AQEAAAABvwEBAMICACHQAQEAwgIAIdgBAADwAusBIusBQADEAgAh7AFAAN0CACGIAgAA7gIAIAIAAAAJACAXAADzAwAgAgAAAPEDACAXAADyAwAgCboBAADwAwAwuwEAAPEDABC8AQAA8AMAML0BAQDCAgAhvwEBAMICACHQAQEAwgIAIdgBAADwAusBIusBQADEAgAh7AFAAN0CACEJugEAAPADADC7AQAA8QMAELwBAADwAwAwvQEBAMICACG_AQEAwgIAIdABAQDCAgAh2AEAAPAC6wEi6wFAAMQCACHsAUAA3QIAIQW9AQEA-gIAIb8BAQD6AgAh2AEAAMsD6wEi6wFAAPwCACHsAUAAiAMAIQcEAADMAwAgCAAAzgMAIL0BAQD6AgAhvwEBAPoCACHYAQAAywPrASLrAUAA_AIAIewBQACIAwAhBwQAANgDACAIAADaAwAgvQEBAAAAAb8BAQAAAAHYAQAAAOsBAusBQAAAAAHsAUAAAAABBB4AAOkDADCMAgAA6gMAMI4CAADsAwAgkgIAAO0DADAEHgAA4AMAMIwCAADhAwAwjgIAAOMDACCSAgAAsAMAMAAAAAAAAAAFjwICAAAAAZUCAgAAAAGWAgIAAAABlwICAAAAAZgCAgAAAAEFjwIIAAAAAZUCCAAAAAGWAggAAAABlwIIAAAAAZgCCAAAAAEBjwIAAAD_AQIFHgAAhAUAIB8AAIoFACCMAgAAhQUAII0CAACJBQAgkgIAAAEAIAseAACaBAAwHwAAngQAMIwCAACbBAAwjQIAAJwEADCOAgAAnQQAII8CAADtAwAwkAIAAO0DADCRAgAA7QMAMJICAADtAwAwkwIAAJ8EADCUAgAA8AMAMAseAACOBAAwHwAAkwQAMIwCAACPBAAwjQIAAJAEADCOAgAAkQQAII8CAACSBAAwkAIAAJIEADCRAgAAkgQAMJICAACSBAAwkwIAAJQEADCUAgAAlQQAMAseAACFBAAwHwAAiQQAMIwCAACGBAAwjQIAAIcEADCOAgAAiAQAII8CAACkAwAwkAIAAKQDADCRAgAApAMAMJICAACkAwAwkwIAAIoEADCUAgAApwMAMAkGAACCAwAgCgAAgAMAIL0BAQAAAAG-AQEAAAABwAEBAAAAAcEBAQAAAAHCAQEAAAABwwEBAAAAAcQBQAAAAAECAAAAFwAgHgAAjQQAIAMAAAAXACAeAACNBAAgHwAAjAQAIAEXAACIBQAwAgAAABcAIBcAAIwEACACAAAAqAMAIBcAAIsEACAHvQEBAPoCACG-AQEA-gIAIcABAQD7AgAhwQEBAPoCACHCAQEA-gIAIcMBAQD7AgAhxAFAAPwCACEJBgAA_wIAIAoAAP0CACC9AQEA-gIAIb4BAQD6AgAhwAEBAPsCACHBAQEA-gIAIcIBAQD6AgAhwwEBAPsCACHEAUAA_AIAIQkGAACCAwAgCgAAgAMAIL0BAQAAAAG-AQEAAAABwAEBAAAAAcEBAQAAAAHCAQEAAAABwwEBAAAAAcQBQAAAAAEQCAAAxQMAIAkAAMYDACALAADHAwAgvQEBAAAAAcQBQAAAAAHTAUAAAAAB2AEAAADnAQLaAQAAANoBAuEBQAAAAAHiAUAAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5wFAAAAAAegBQAAAAAHpASAAAAABAgAAACQAIB4AAJkEACADAAAAJAAgHgAAmQQAIB8AAJgEACABFwAAhwUAMBUEAADiAgAgCAAA4wIAIAkAAMYCACALAADbAgAgugEAAOACADC7AQAAGgAQvAEAAOACADC9AQEAAAABvwEBAMICACHEAUAAxAIAIdMBQADEAgAh2AEAAOEC5wEi2gEAANcC2gEi4QFAAMQCACHiAUAAxAIAIeMBAQDDAgAh5AEBAAAAAeUBAQDDAgAh5wFAAMQCACHoAUAA3QIAIekBIADUAgAhAgAAACQAIBcAAJgEACACAAAAlgQAIBcAAJcEACARugEAAJUEADC7AQAAlgQAELwBAACVBAAwvQEBAMICACG_AQEAwgIAIcQBQADEAgAh0wFAAMQCACHYAQAA4QLnASLaAQAA1wLaASLhAUAAxAIAIeIBQADEAgAh4wEBAMMCACHkAQEAwgIAIeUBAQDDAgAh5wFAAMQCACHoAUAA3QIAIekBIADUAgAhEboBAACVBAAwuwEAAJYEABC8AQAAlQQAML0BAQDCAgAhvwEBAMICACHEAUAAxAIAIdMBQADEAgAh2AEAAOEC5wEi2gEAANcC2gEi4QFAAMQCACHiAUAAxAIAIeMBAQDDAgAh5AEBAMICACHlAQEAwwIAIecBQADEAgAh6AFAAN0CACHpASAA1AIAIQ29AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHYAQAAmwPnASLaAQAAkgPaASLhAUAA_AIAIeIBQAD8AgAh4wEBAPsCACHkAQEA-gIAIeUBAQD7AgAh5wFAAPwCACHoAUAAiAMAIekBIACTAwAhEAgAAJ0DACAJAACeAwAgCwAAnwMAIL0BAQD6AgAhxAFAAPwCACHTAUAA_AIAIdgBAACbA-cBItoBAACSA9oBIuEBQAD8AgAh4gFAAPwCACHjAQEA-wIAIeQBAQD6AgAh5QEBAPsCACHnAUAA_AIAIegBQACIAwAh6QEgAJMDACEQCAAAxQMAIAkAAMYDACALAADHAwAgvQEBAAAAAcQBQAAAAAHTAUAAAAAB2AEAAADnAQLaAQAAANoBAuEBQAAAAAHiAUAAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5wFAAAAAAegBQAAAAAHpASAAAAABBwgAANoDACANAADZAwAgvQEBAAAAAdABAQAAAAHYAQAAAOsBAusBQAAAAAHsAUAAAAABAgAAAAkAIB4AAKIEACADAAAACQAgHgAAogQAIB8AAKEEACABFwAAhgUAMAIAAAAJACAXAAChBAAgAgAAAPEDACAXAACgBAAgBb0BAQD6AgAh0AEBAPoCACHYAQAAywPrASLrAUAA_AIAIewBQACIAwAhBwgAAM4DACANAADNAwAgvQEBAPoCACHQAQEA-gIAIdgBAADLA-sBIusBQAD8AgAh7AFAAIgDACEHCAAA2gMAIA0AANkDACC9AQEAAAAB0AEBAAAAAdgBAAAA6wEC6wFAAAAAAewBQAAAAAEDHgAAhAUAIIwCAACFBQAgkgIAAAEAIAQeAACaBAAwjAIAAJsEADCOAgAAnQQAIJICAADtAwAwBB4AAI4EADCMAgAAjwQAMI4CAACRBAAgkgIAAJIEADAEHgAAhQQAMIwCAACGBAAwjgIAAIgEACCSAgAApAMAMAAAAAUeAAD_BAAgHwAAggUAIIwCAACABQAgjQIAAIEFACCSAgAAAQAgAx4AAP8EACCMAgAAgAUAIJICAAABACAAAAAFHgAA-gQAIB8AAP0EACCMAgAA-wQAII0CAAD8BAAgkgIAAAEAIAMeAAD6BAAgjAIAAPsEACCSAgAAAQAgAAAAAAALHgAA2wQAMB8AAOAEADCMAgAA3AQAMI0CAADdBAAwjgIAAN4EACCPAgAA3wQAMJACAADfBAAwkQIAAN8EADCSAgAA3wQAMJMCAADhBAAwlAIAAOIEADALHgAAzwQAMB8AANQEADCMAgAA0AQAMI0CAADRBAAwjgIAANIEACCPAgAA0wQAMJACAADTBAAwkQIAANMEADCSAgAA0wQAMJMCAADVBAAwlAIAANYEADALHgAAwwQAMB8AAMgEADCMAgAAxAQAMI0CAADFBAAwjgIAAMYEACCPAgAAxwQAMJACAADHBAAwkQIAAMcEADCSAgAAxwQAMJMCAADJBAAwlAIAAMoEADALHgAAugQAMB8AAL4EADCMAgAAuwQAMI0CAAC8BAAwjgIAAL0EACCPAgAApAMAMJACAACkAwAwkQIAAKQDADCSAgAApAMAMJMCAAC_BAAwlAIAAKcDADAJBAAAgQMAIAYAAIIDACC9AQEAAAABvwEBAAAAAcABAQAAAAHBAQEAAAABwgEBAAAAAcMBAQAAAAHEAUAAAAABAgAAABcAIB4AAMIEACADAAAAFwAgHgAAwgQAIB8AAMEEACABFwAA-QQAMAIAAAAXACAXAADBBAAgAgAAAKgDACAXAADABAAgB70BAQD6AgAhvwEBAPsCACHAAQEA-wIAIcEBAQD6AgAhwgEBAPoCACHDAQEA-wIAIcQBQAD8AgAhCQQAAP4CACAGAAD_AgAgvQEBAPoCACG_AQEA-wIAIcABAQD7AgAhwQEBAPoCACHCAQEA-gIAIcMBAQD7AgAhxAFAAPwCACEJBAAAgQMAIAYAAIIDACC9AQEAAAABvwEBAAAAAcABAQAAAAHBAQEAAAABwgEBAAAAAcMBAQAAAAHEAUAAAAABBb0BAQAAAAHEAUAAAAAB0wFAAAAAAeQBAQAAAAH_AUAAAAABAgAAADAAIB4AAM4EACADAAAAMAAgHgAAzgQAIB8AAM0EACABFwAA-AQAMAoKAADeAgAgugEAANwCADC7AQAALgAQvAEAANwCADC9AQEAAAABvgEBAMICACHEAUAAxAIAIdMBQADEAgAh5AEBAAAAAf8BQADdAgAhAgAAADAAIBcAAM0EACACAAAAywQAIBcAAMwEACAJugEAAMoEADC7AQAAywQAELwBAADKBAAwvQEBAMICACG-AQEAwgIAIcQBQADEAgAh0wFAAMQCACHkAQEAwgIAIf8BQADdAgAhCboBAADKBAAwuwEAAMsEABC8AQAAygQAML0BAQDCAgAhvgEBAMICACHEAUAAxAIAIdMBQADEAgAh5AEBAMICACH_AUAA3QIAIQW9AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHkAQEA-gIAIf8BQACIAwAhBb0BAQD6AgAhxAFAAPwCACHTAUAA_AIAIeQBAQD6AgAh_wFAAIgDACEFvQEBAAAAAcQBQAAAAAHTAUAAAAAB5AEBAAAAAf8BQAAAAAEEvQEBAAAAAcQBQAAAAAHTAUAAAAAB5AEBAAAAAQIAAAAsACAeAADaBAAgAwAAACwAIB4AANoEACAfAADZBAAgARcAAPcEADAJCgAA3gIAILoBAADfAgAwuwEAACoAELwBAADfAgAwvQEBAAAAAb4BAQDCAgAhxAFAAMQCACHTAUAAxAIAIeQBAQAAAAECAAAALAAgFwAA2QQAIAIAAADXBAAgFwAA2AQAIAi6AQAA1gQAMLsBAADXBAAQvAEAANYEADC9AQEAwgIAIb4BAQDCAgAhxAFAAMQCACHTAUAAxAIAIeQBAQDCAgAhCLoBAADWBAAwuwEAANcEABC8AQAA1gQAML0BAQDCAgAhvgEBAMICACHEAUAAxAIAIdMBQADEAgAh5AEBAMICACEEvQEBAPoCACHEAUAA_AIAIdMBQAD8AgAh5AEBAPoCACEEvQEBAPoCACHEAUAA_AIAIdMBQAD8AgAh5AEBAPoCACEEvQEBAAAAAcQBQAAAAAHTAUAAAAAB5AEBAAAAAREFAACkBAAgBgEAAAABCwAApgQAIA4AAKUEACC9AQEAAAABxAFAAAAAAdgBAAAA_wEC4QFAAAAAAe8BAQAAAAHwAQEAAAAB9wEBAAAAAfgBAQAAAAH5AQEAAAAB-gEBAAAAAfsBAQAAAAH8AQIAAAAB_QEIAAAAAQIAAAAFACAeAADmBAAgAwAAAAUAIB4AAOYEACAfAADlBAAgARcAAPYEADAXAwAA3gIAIAUAAMUCACAGAQDCAgAhCwAA2wIAIA4AAPUCACC6AQAA8gIAMLsBAAADABC8AQAA8gIAML0BAQAAAAHEAUAAxAIAIdgBAAD0Av8BIuEBQADEAgAh7wEBAMMCACHwAQEAwwIAIfYBAQDCAgAh9wEBAMICACH4AQEAwgIAIfkBAQDCAgAh-gEBAMMCACH7AQEAwwIAIfwBAgDzAgAh_QEIANUCACGJAgAA8QIAIAIAAAAFACAXAADlBAAgAgAAAOMEACAXAADkBAAgEgYBAMICACG6AQAA4gQAMLsBAADjBAAQvAEAAOIEADC9AQEAwgIAIcQBQADEAgAh2AEAAPQC_wEi4QFAAMQCACHvAQEAwwIAIfABAQDDAgAh9gEBAMICACH3AQEAwgIAIfgBAQDCAgAh-QEBAMICACH6AQEAwwIAIfsBAQDDAgAh_AECAPMCACH9AQgA1QIAIRIGAQDCAgAhugEAAOIEADC7AQAA4wQAELwBAADiBAAwvQEBAMICACHEAUAAxAIAIdgBAAD0Av8BIuEBQADEAgAh7wEBAMMCACHwAQEAwwIAIfYBAQDCAgAh9wEBAMICACH4AQEAwgIAIfkBAQDCAgAh-gEBAMMCACH7AQEAwwIAIfwBAgDzAgAh_QEIANUCACEOBgEA-gIAIb0BAQD6AgAhxAFAAPwCACHYAQAAgAT_ASLhAUAA_AIAIe8BAQD7AgAh8AEBAPsCACH3AQEA-gIAIfgBAQD6AgAh-QEBAPoCACH6AQEA-wIAIfsBAQD7AgAh_AECAP4DACH9AQgA_wMAIREFAACCBAAgBgEA-gIAIQsAAIQEACAOAACDBAAgvQEBAPoCACHEAUAA_AIAIdgBAACABP8BIuEBQAD8AgAh7wEBAPsCACHwAQEA-wIAIfcBAQD6AgAh-AEBAPoCACH5AQEA-gIAIfoBAQD7AgAh-wEBAPsCACH8AQIA_gMAIf0BCAD_AwAhEQUAAKQEACAGAQAAAAELAACmBAAgDgAApQQAIL0BAQAAAAHEAUAAAAAB2AEAAAD_AQLhAUAAAAAB7wEBAAAAAfABAQAAAAH3AQEAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAgAAAAH9AQgAAAABBB4AANsEADCMAgAA3AQAMI4CAADeBAAgkgIAAN8EADAEHgAAzwQAMIwCAADQBAAwjgIAANIEACCSAgAA0wQAMAQeAADDBAAwjAIAAMQEADCOAgAAxgQAIJICAADHBAAwBB4AALoEADCMAgAAuwQAMI4CAAC9BAAgkgIAAKQDADAAAAAABgsAAO4EACAPAADrBAAgEAAA7AQAIBEAAO0EACDvAQAA9gIAIIECAAD2AgAgCQMAAO8EACAFAAD3AwAgCwAA7gQAIA4AAPUEACDvAQAA9gIAIPABAAD2AgAg-gEAAPYCACD7AQAA9gIAIPwBAAD2AgAgAAcEAADwBAAgCAAA8QQAIAkAAPgDACALAADuBAAg4wEAAPYCACDlAQAA9gIAIOgBAAD2AgAgBAQAAPAEACAIAADxBAAgDQAA9AQAIOwBAAD2AgAgBwUAAPcDACAJAAD4AwAg0gEAAPYCACDvAQAA9gIAIPABAAD2AgAg8QEAAPYCACDyAQAA9gIAIAAOBgEAAAABvQEBAAAAAcQBQAAAAAHYAQAAAP8BAuEBQAAAAAHvAQEAAAAB8AEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAAAAAfoBAQAAAAH7AQEAAAAB_AECAAAAAf0BCAAAAAEEvQEBAAAAAcQBQAAAAAHTAUAAAAAB5AEBAAAAAQW9AQEAAAABxAFAAAAAAdMBQAAAAAHkAQEAAAAB_wFAAAAAAQe9AQEAAAABvwEBAAAAAcABAQAAAAHBAQEAAAABwgEBAAAAAcMBAQAAAAHEAUAAAAABEAsAAOoEACAPAADnBAAgEQAA6QQAIL0BAQAAAAHEAUAAAAAB0gEBAAAAAeEBQAAAAAHuAQEAAAAB7wEBAAAAAYACAQAAAAGBAgEAAAABggIgAAAAAYMCAQAAAAGEAggAAAABhQICAAAAAYYCAAAA2gECAgAAAAEAIB4AAPoEACADAAAAOAAgHgAA-gQAIB8AAP4EACASAAAAOAAgCwAAuQQAIA8AALYEACARAAC4BAAgFwAA_gQAIL0BAQD6AgAhxAFAAPwCACHSAQEA-gIAIeEBQAD8AgAh7gEBAPoCACHvAQEA-wIAIYACAQD6AgAhgQIBAPsCACGCAiAAkwMAIYMCAQD6AgAhhAIIAP8DACGFAgIAiQMAIYYCAACSA9oBIhALAAC5BAAgDwAAtgQAIBEAALgEACC9AQEA-gIAIcQBQAD8AgAh0gEBAPoCACHhAUAA_AIAIe4BAQD6AgAh7wEBAPsCACGAAgEA-gIAIYECAQD7AgAhggIgAJMDACGDAgEA-gIAIYQCCAD_AwAhhQICAIkDACGGAgAAkgPaASIQCwAA6gQAIA8AAOcEACAQAADoBAAgvQEBAAAAAcQBQAAAAAHSAQEAAAAB4QFAAAAAAe4BAQAAAAHvAQEAAAABgAIBAAAAAYECAQAAAAGCAiAAAAABgwIBAAAAAYQCCAAAAAGFAgIAAAABhgIAAADaAQICAAAAAQAgHgAA_wQAIAMAAAA4ACAeAAD_BAAgHwAAgwUAIBIAAAA4ACALAAC5BAAgDwAAtgQAIBAAALcEACAXAACDBQAgvQEBAPoCACHEAUAA_AIAIdIBAQD6AgAh4QFAAPwCACHuAQEA-gIAIe8BAQD7AgAhgAIBAPoCACGBAgEA-wIAIYICIACTAwAhgwIBAPoCACGEAggA_wMAIYUCAgCJAwAhhgIAAJID2gEiEAsAALkEACAPAAC2BAAgEAAAtwQAIL0BAQD6AgAhxAFAAPwCACHSAQEA-gIAIeEBQAD8AgAh7gEBAPoCACHvAQEA-wIAIYACAQD6AgAhgQIBAPsCACGCAiAAkwMAIYMCAQD6AgAhhAIIAP8DACGFAgIAiQMAIYYCAACSA9oBIhALAADqBAAgEAAA6AQAIBEAAOkEACC9AQEAAAABxAFAAAAAAdIBAQAAAAHhAUAAAAAB7gEBAAAAAe8BAQAAAAGAAgEAAAABgQIBAAAAAYICIAAAAAGDAgEAAAABhAIIAAAAAYUCAgAAAAGGAgAAANoBAgIAAAABACAeAACEBQAgBb0BAQAAAAHQAQEAAAAB2AEAAADrAQLrAUAAAAAB7AFAAAAAAQ29AQEAAAABxAFAAAAAAdMBQAAAAAHYAQAAAOcBAtoBAAAA2gEC4QFAAAAAAeIBQAAAAAHjAQEAAAAB5AEBAAAAAeUBAQAAAAHnAUAAAAAB6AFAAAAAAekBIAAAAAEHvQEBAAAAAb4BAQAAAAHAAQEAAAABwQEBAAAAAcIBAQAAAAHDAQEAAAABxAFAAAAAAQMAAAA4ACAeAACEBQAgHwAAiwUAIBIAAAA4ACALAAC5BAAgEAAAtwQAIBEAALgEACAXAACLBQAgvQEBAPoCACHEAUAA_AIAIdIBAQD6AgAh4QFAAPwCACHuAQEA-gIAIe8BAQD7AgAhgAIBAPoCACGBAgEA-wIAIYICIACTAwAhgwIBAPoCACGEAggA_wMAIYUCAgCJAwAhhgIAAJID2gEiEAsAALkEACAQAAC3BAAgEQAAuAQAIL0BAQD6AgAhxAFAAPwCACHSAQEA-gIAIeEBQAD8AgAh7gEBAPoCACHvAQEA-wIAIYACAQD6AgAhgQIBAPsCACGCAiAAkwMAIYMCAQD6AgAhhAIIAP8DACGFAgIAiQMAIYYCAACSA9oBIgW9AQEAAAABvwEBAAAAAdgBAAAA6wEC6wFAAAAAAewBQAAAAAEIvQEBAAAAAcABAQAAAAHEAUAAAAAB0QEBAAAAAdIBAQAAAAHTAUAAAAAB1AFAAAAAAdUBAgAAAAELCQAA9gMAIL0BAQAAAAHEAUAAAAAB0gEBAAAAAeEBQAAAAAHtAQEAAAAB7gEBAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAECAAAAkAEAIB4AAI4FACASAwAAowQAIAYBAAAAAQsAAKYEACAOAAClBAAgvQEBAAAAAcQBQAAAAAHYAQAAAP8BAuEBQAAAAAHvAQEAAAAB8AEBAAAAAfYBAQAAAAH3AQEAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAgAAAAH9AQgAAAABAgAAAAUAIB4AAJAFACANvQEBAAAAAcABAQAAAAHDAQEAAAABxAFAAAAAAdgBAAAA2AEC2gEAAADaAQLbAQEAAAAB3AFAAAAAAd0BAQAAAAHeASAAAAAB3wEBAAAAAeABAQAAAAHhAUAAAAABAwAAAJMBACAeAACOBQAgHwAAlQUAIA0AAACTAQAgCQAA3wMAIBcAAJUFACC9AQEA-gIAIcQBQAD8AgAh0gEBAPsCACHhAUAA_AIAIe0BAQD6AgAh7gEBAPoCACHvAQEA-wIAIfABAQD7AgAh8QEBAPsCACHyAQEA-wIAIQsJAADfAwAgvQEBAPoCACHEAUAA_AIAIdIBAQD7AgAh4QFAAPwCACHtAQEA-gIAIe4BAQD6AgAh7wEBAPsCACHwAQEA-wIAIfEBAQD7AgAh8gEBAPsCACEDAAAAAwAgHgAAkAUAIB8AAJgFACAUAAAAAwAgAwAAgQQAIAYBAPoCACELAACEBAAgDgAAgwQAIBcAAJgFACC9AQEA-gIAIcQBQAD8AgAh2AEAAIAE_wEi4QFAAPwCACHvAQEA-wIAIfABAQD7AgAh9gEBAPoCACH3AQEA-gIAIfgBAQD6AgAh-QEBAPoCACH6AQEA-wIAIfsBAQD7AgAh_AECAP4DACH9AQgA_wMAIRIDAACBBAAgBgEA-gIAIQsAAIQEACAOAACDBAAgvQEBAPoCACHEAUAA_AIAIdgBAACABP8BIuEBQAD8AgAh7wEBAPsCACHwAQEA-wIAIfYBAQD6AgAh9wEBAPoCACH4AQEA-gIAIfkBAQD6AgAh-gEBAPsCACH7AQEA-wIAIfwBAgD-AwAh_QEIAP8DACESAwAAowQAIAUAAKQEACAGAQAAAAELAACmBAAgvQEBAAAAAcQBQAAAAAHYAQAAAP8BAuEBQAAAAAHvAQEAAAAB8AEBAAAAAfYBAQAAAAH3AQEAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAgAAAAH9AQgAAAABAgAAAAUAIB4AAJkFACANvQEBAAAAAcMBAQAAAAHEAUAAAAAB1gEBAAAAAdgBAAAA2AEC2gEAAADaAQLbAQEAAAAB3AFAAAAAAd0BAQAAAAHeASAAAAAB3wEBAAAAAeABAQAAAAHhAUAAAAABCL0BAQAAAAHEAUAAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB0wFAAAAAAdQBQAAAAAHVAQIAAAABB70BAQAAAAG-AQEAAAABvwEBAAAAAcEBAQAAAAHCAQEAAAABwwEBAAAAAcQBQAAAAAEDAAAAAwAgHgAAmQUAIB8AAKAFACAUAAAAAwAgAwAAgQQAIAUAAIIEACAGAQD6AgAhCwAAhAQAIBcAAKAFACC9AQEA-gIAIcQBQAD8AgAh2AEAAIAE_wEi4QFAAPwCACHvAQEA-wIAIfABAQD7AgAh9gEBAPoCACH3AQEA-gIAIfgBAQD6AgAh-QEBAPoCACH6AQEA-wIAIfsBAQD7AgAh_AECAP4DACH9AQgA_wMAIRIDAACBBAAgBQAAggQAIAYBAPoCACELAACEBAAgvQEBAPoCACHEAUAA_AIAIdgBAACABP8BIuEBQAD8AgAh7wEBAPsCACHwAQEA-wIAIfYBAQD6AgAh9wEBAPoCACH4AQEA-gIAIfkBAQD6AgAh-gEBAPsCACH7AQEA-wIAIfwBAgD-AwAh_QEIAP8DACEIBAAA2AMAIA0AANkDACC9AQEAAAABvwEBAAAAAdABAQAAAAHYAQAAAOsBAusBQAAAAAHsAUAAAAABAgAAAAkAIB4AAKEFACARBAAAxAMAIAkAAMYDACALAADHAwAgvQEBAAAAAb8BAQAAAAHEAUAAAAAB0wFAAAAAAdgBAAAA5wEC2gEAAADaAQLhAUAAAAAB4gFAAAAAAeMBAQAAAAHkAQEAAAAB5QEBAAAAAecBQAAAAAHoAUAAAAAB6QEgAAAAAQIAAAAkACAeAACjBQAgAwAAAAcAIB4AAKEFACAfAACnBQAgCgAAAAcAIAQAAMwDACANAADNAwAgFwAApwUAIL0BAQD6AgAhvwEBAPoCACHQAQEA-gIAIdgBAADLA-sBIusBQAD8AgAh7AFAAIgDACEIBAAAzAMAIA0AAM0DACC9AQEA-gIAIb8BAQD6AgAh0AEBAPoCACHYAQAAywPrASLrAUAA_AIAIewBQACIAwAhAwAAABoAIB4AAKMFACAfAACqBQAgEwAAABoAIAQAAJwDACAJAACeAwAgCwAAnwMAIBcAAKoFACC9AQEA-gIAIb8BAQD6AgAhxAFAAPwCACHTAUAA_AIAIdgBAACbA-cBItoBAACSA9oBIuEBQAD8AgAh4gFAAPwCACHjAQEA-wIAIeQBAQD6AgAh5QEBAPsCACHnAUAA_AIAIegBQACIAwAh6QEgAJMDACERBAAAnAMAIAkAAJ4DACALAACfAwAgvQEBAPoCACG_AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHYAQAAmwPnASLaAQAAkgPaASLhAUAA_AIAIeIBQAD8AgAh4wEBAPsCACHkAQEA-gIAIeUBAQD7AgAh5wFAAPwCACHoAUAAiAMAIekBIACTAwAhCwUAAPUDACC9AQEAAAABxAFAAAAAAdIBAQAAAAHhAUAAAAAB7QEBAAAAAe4BAQAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAABAgAAAJABACAeAACrBQAgEQQAAMQDACAIAADFAwAgCwAAxwMAIL0BAQAAAAG_AQEAAAABxAFAAAAAAdMBQAAAAAHYAQAAAOcBAtoBAAAA2gEC4QFAAAAAAeIBQAAAAAHjAQEAAAAB5AEBAAAAAeUBAQAAAAHnAUAAAAAB6AFAAAAAAekBIAAAAAECAAAAJAAgHgAArQUAIAMAAACTAQAgHgAAqwUAIB8AALEFACANAAAAkwEAIAUAAN4DACAXAACxBQAgvQEBAPoCACHEAUAA_AIAIdIBAQD7AgAh4QFAAPwCACHtAQEA-gIAIe4BAQD6AgAh7wEBAPsCACHwAQEA-wIAIfEBAQD7AgAh8gEBAPsCACELBQAA3gMAIL0BAQD6AgAhxAFAAPwCACHSAQEA-wIAIeEBQAD8AgAh7QEBAPoCACHuAQEA-gIAIe8BAQD7AgAh8AEBAPsCACHxAQEA-wIAIfIBAQD7AgAhAwAAABoAIB4AAK0FACAfAAC0BQAgEwAAABoAIAQAAJwDACAIAACdAwAgCwAAnwMAIBcAALQFACC9AQEA-gIAIb8BAQD6AgAhxAFAAPwCACHTAUAA_AIAIdgBAACbA-cBItoBAACSA9oBIuEBQAD8AgAh4gFAAPwCACHjAQEA-wIAIeQBAQD6AgAh5QEBAPsCACHnAUAA_AIAIegBQACIAwAh6QEgAJMDACERBAAAnAMAIAgAAJ0DACALAACfAwAgvQEBAPoCACG_AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHYAQAAmwPnASLaAQAAkgPaASLhAUAA_AIAIeIBQAD8AgAh4wEBAPsCACHkAQEA-gIAIeUBAQD7AgAh5wFAAPwCACHoAUAAiAMAIekBIACTAwAhEQQAAMQDACAIAADFAwAgCQAAxgMAIL0BAQAAAAG_AQEAAAABxAFAAAAAAdMBQAAAAAHYAQAAAOcBAtoBAAAA2gEC4QFAAAAAAeIBQAAAAAHjAQEAAAAB5AEBAAAAAeUBAQAAAAHnAUAAAAAB6AFAAAAAAekBIAAAAAECAAAAJAAgHgAAtQUAIBIDAACjBAAgBQAApAQAIAYBAAAAAQ4AAKUEACC9AQEAAAABxAFAAAAAAdgBAAAA_wEC4QFAAAAAAe8BAQAAAAHwAQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAAAAAfoBAQAAAAH7AQEAAAAB_AECAAAAAf0BCAAAAAECAAAABQAgHgAAtwUAIBAPAADnBAAgEAAA6AQAIBEAAOkEACC9AQEAAAABxAFAAAAAAdIBAQAAAAHhAUAAAAAB7gEBAAAAAe8BAQAAAAGAAgEAAAABgQIBAAAAAYICIAAAAAGDAgEAAAABhAIIAAAAAYUCAgAAAAGGAgAAANoBAgIAAAABACAeAAC5BQAgAwAAABoAIB4AALUFACAfAAC9BQAgEwAAABoAIAQAAJwDACAIAACdAwAgCQAAngMAIBcAAL0FACC9AQEA-gIAIb8BAQD6AgAhxAFAAPwCACHTAUAA_AIAIdgBAACbA-cBItoBAACSA9oBIuEBQAD8AgAh4gFAAPwCACHjAQEA-wIAIeQBAQD6AgAh5QEBAPsCACHnAUAA_AIAIegBQACIAwAh6QEgAJMDACERBAAAnAMAIAgAAJ0DACAJAACeAwAgvQEBAPoCACG_AQEA-gIAIcQBQAD8AgAh0wFAAPwCACHYAQAAmwPnASLaAQAAkgPaASLhAUAA_AIAIeIBQAD8AgAh4wEBAPsCACHkAQEA-gIAIeUBAQD7AgAh5wFAAPwCACHoAUAAiAMAIekBIACTAwAhAwAAAAMAIB4AALcFACAfAADABQAgFAAAAAMAIAMAAIEEACAFAACCBAAgBgEA-gIAIQ4AAIMEACAXAADABQAgvQEBAPoCACHEAUAA_AIAIdgBAACABP8BIuEBQAD8AgAh7wEBAPsCACHwAQEA-wIAIfYBAQD6AgAh9wEBAPoCACH4AQEA-gIAIfkBAQD6AgAh-gEBAPsCACH7AQEA-wIAIfwBAgD-AwAh_QEIAP8DACESAwAAgQQAIAUAAIIEACAGAQD6AgAhDgAAgwQAIL0BAQD6AgAhxAFAAPwCACHYAQAAgAT_ASLhAUAA_AIAIe8BAQD7AgAh8AEBAPsCACH2AQEA-gIAIfcBAQD6AgAh-AEBAPoCACH5AQEA-gIAIfoBAQD7AgAh-wEBAPsCACH8AQIA_gMAIf0BCAD_AwAhAwAAADgAIB4AALkFACAfAADDBQAgEgAAADgAIA8AALYEACAQAAC3BAAgEQAAuAQAIBcAAMMFACC9AQEA-gIAIcQBQAD8AgAh0gEBAPoCACHhAUAA_AIAIe4BAQD6AgAh7wEBAPsCACGAAgEA-gIAIYECAQD7AgAhggIgAJMDACGDAgEA-gIAIYQCCAD_AwAhhQICAIkDACGGAgAAkgPaASIQDwAAtgQAIBAAALcEACARAAC4BAAgvQEBAPoCACHEAUAA_AIAIdIBAQD6AgAh4QFAAPwCACHuAQEA-gIAIe8BAQD7AgAhgAIBAPoCACGBAgEA-wIAIYICIACTAwAhgwIBAPoCACGEAggA_wMAIYUCAgCJAwAhhgIAAJID2gEiBQsyCAwADw8GAhAtDRExDgUDAAEFCgMLJggMAAwOJQYEBAACCCEHDAALDQAEAwULAwkPBQwACgIGAAYNAAQFBAACCBMHCRQFCxgIDAAJAgYABgcAAwMEGQIGGwYKAAEDCBwACR0ACx4AAgUfAAkgAAEIIgADBScACykADigAAQoAAQEKAAEECzYADzMAEDQAETUAAAAABQwAFCQAFSUAFiYAFycAGAAAAAAABQwAFCQAFSUAFiYAFycAGAEKAAEBCgABAwwAHSYAHicAHwAAAAMMAB0mAB4nAB8BCgABAQoAAQMMACQmACUnACYAAAADDAAkJgAlJwAmAQMAAQEDAAEFDAArJAAsJQAtJgAuJwAvAAAAAAAFDAArJAAsJQAtJgAuJwAvAAADDAA0JgA1JwA2AAAAAwwANCYANScANgIEAAINAAQCBAACDQAEAwwAOyYAPCcAPQAAAAMMADsmADwnAD0BBAACAQQAAgMMAEImAEMnAEQAAAADDABCJgBDJwBEAgYABgcAAwIGAAYHAAMDDABJJgBKJwBLAAAAAwwASSYASicASwIGAAYNAAQCBgAGDQAEBQwAUCQAUSUAUiYAUycAVAAAAAAABQwAUCQAUSUAUiYAUycAVAMEiwICBowCBgoAAQMEkgICBpMCBgoAAQMMAFkmAFonAFsAAAADDABZJgBaJwBbEgIBEzcBFDoBFTsBFjwBGD4BGUAQGkERG0MBHEUQHUYSIEcBIUgBIkkQKEwTKU0ZKk4NK08NLFANLVENLlINL1QNMFYQMVcaMlkNM1sQNFwbNV0NNl4NN18QOGIcOWMgOmQOO2UOPGYOPWcOPmgOP2oOQGwQQW0hQm8OQ3EQRHIiRXMORnQOR3UQSHgjSXknSnoCS3sCTHwCTX0CTn4CT4ABAlCCARBRgwEoUoUBAlOHARBUiAEpVYkBAlaKAQJXiwEQWI4BKlmPATBakQEEW5IBBFyVAQRdlgEEXpcBBF-ZAQRgmwEQYZwBMWKeAQRjoAEQZKEBMmWiAQRmowEEZ6QBEGinATNpqAE3aqkBA2uqAQNsqwEDbawBA26tAQNvrwEDcLEBEHGyAThytAEDc7YBEHS3ATl1uAEDdrkBA3e6ARB4vQE6eb4BPnq_AQZ7wAEGfMEBBn3CAQZ-wwEGf8UBBoABxwEQgQHIAT-CAcoBBoMBzAEQhAHNAUCFAc4BBoYBzwEGhwHQARCIAdMBQYkB1AFFigHVAQeLAdYBB4wB1wEHjQHYAQeOAdkBB48B2wEHkAHdARCRAd4BRpIB4AEHkwHiARCUAeMBR5UB5AEHlgHlAQeXAeYBEJgB6QFImQHqAUyaAesBBZsB7AEFnAHtAQWdAe4BBZ4B7wEFnwHxAQWgAfMBEKEB9AFNogH2AQWjAfgBEKQB-QFOpQH6AQWmAfsBBacB_AEQqAH_AU-pAYACVaoBgQIIqwGCAgisAYMCCK0BhAIIrgGFAgivAYcCCLABiQIQsQGKAlayAY4CCLMBkAIQtAGRAle1AZQCCLYBlQIItwGWAhC4AZkCWLkBmgJc"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("node:buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}
runtime.Extensions.getExtensionContext;
({
  DbNull: runtime.NullTypes.DbNull,
  JsonNull: runtime.NullTypes.JsonNull,
  AnyNull: runtime.NullTypes.AnyNull
});
runtime.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
runtime.Extensions.defineExtension;
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
const PrismaClient = getPrismaClientClass();
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://mac@localhost:5432/classmark?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
const sessionSecret = process.env.SESSION_SECRET || "classmark-super-secure-jwt-session-secret-key-32chars-minimum";
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "classmark_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    // 7 days
    httpOnly: true
  }
});
async function getSession(request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}
async function getUserId(request) {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId;
}
async function getUser(request) {
  const userId = await getUserId(request);
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        institution: true,
        department: true,
        isEmailVerified: true,
        timeZone: true,
        defaultThreshold: true,
        defaultSessionDuration: true,
        defaultVerificationMethod: true
      }
    });
    if (user) return user;
  } catch (error) {
    console.error("Failed to fetch user from session:", error);
    return null;
  }
  throw await logout(request);
}
async function requireUserId(request, redirectTo = new URL(request.url).pathname) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["from", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}
async function requireUser(request) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      institution: true,
      department: true,
      isEmailVerified: true,
      timeZone: true,
      defaultThreshold: true,
      defaultSessionDuration: true,
      defaultVerificationMethod: true
    }
  });
  if (user) return user;
  throw await logout(request);
}
async function logout(request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}
const AuthContext = createContext({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  logout: async () => {
  },
  refresh: async () => {
  }
});
function AuthProvider({
  children,
  initialUser = null
}) {
  const [user, setUser] = useState(initialUser);
  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    }
  };
  const logout2 = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed:", e);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading: false,
        isAuthenticated: !!user,
        logout: logout2,
        refresh
      },
      children
    }
  );
}
async function loader$g({
  request
}) {
  const user = await getUser(request);
  return {
    user
  };
}
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    className: "h-full antialiased",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx("title", {
        children: "ClassMark | University Attendance Platform"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      }), /* @__PURE__ */ jsx("link", {
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
        rel: "stylesheet"
      }), /* @__PURE__ */ jsx("link", {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg?v=2"
      }), /* @__PURE__ */ jsx("link", {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png?v=2"
      }), /* @__PURE__ */ jsx("link", {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png?v=2"
      }), /* @__PURE__ */ jsx("link", {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png?v=2"
      }), /* @__PURE__ */ jsx("link", {
        rel: "shortcut icon",
        href: "/favicon.ico?v=2"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "min-h-full flex flex-col font-sans",
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App({
  loaderData
}) {
  return /* @__PURE__ */ jsx(AuthProvider, {
    initialUser: loaderData?.user,
    children: /* @__PURE__ */ jsx(Outlet, {})
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Not Found" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen flex items-center justify-center p-6 bg-[#faf9f5]",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-md w-full bg-white rounded-[28px] shadow-sm border border-[#e7e5df] p-8 text-center",
      children: [/* @__PURE__ */ jsx("div", {
        className: "w-12 h-12 rounded-full bg-[#111111] text-[#d7f837] flex items-center justify-center mx-auto mb-4 font-bold text-lg",
        children: "!"
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-extrabold text-[#111111] tracking-tight mb-2",
        children: message
      }), /* @__PURE__ */ jsx("p", {
        className: "text-[#666660] text-sm mb-6 leading-relaxed",
        children: details
      }), stack, /* @__PURE__ */ jsx("a", {
        href: "/",
        className: "inline-flex items-center justify-center px-6 py-2.5 bg-[#111111] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#d7f837] hover:text-black transition-all shadow-sm",
        children: "Return Home"
      })]
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  loader: loader$g
}, Symbol.toStringTag, { value: "Module" }));
async function loader$f({
  request
}) {
  const user = await getUser(request);
  if (user) {
    throw redirect("/dashboard");
  }
  return null;
}
const home = UNSAFE_withComponentProps(function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState("projector");
  const [demoTicker, setDemoTicker] = useState(388);
  const [demoTimeLeft, setDemoTimeLeft] = useState("04:18");
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("all");
  useEffect(() => {
    if (mobileMenuOpen || activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, activeModal]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMegaMenuOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoTicker((prev) => prev < 410 ? prev + 1 : 388);
    }, 3800);
    return () => clearInterval(timer);
  }, []);
  const closeMenu = () => setMobileMenuOpen(false);
  const studentsMock = [{
    matric: "001429",
    name: "Adebayo Kehinde",
    attended: 22,
    total: 24,
    percent: 91.7,
    status: "CLEARED",
    device: "iPhone 14 Pro"
  }, {
    matric: "001580",
    name: "Okafor Chinedu",
    attended: 20,
    total: 24,
    percent: 83.3,
    status: "CLEARED",
    device: "Galaxy S23"
  }, {
    matric: "001715",
    name: "Balogun Aisha",
    attended: 18,
    total: 24,
    percent: 75,
    status: "CLEARED",
    device: "iPhone 13"
  }, {
    matric: "001890",
    name: "Eze Emeka",
    attended: 15,
    total: 24,
    percent: 62.5,
    status: "CLEARED",
    device: "Redmi Note 12"
  }, {
    matric: "001602",
    name: "Danjuma Musa",
    attended: 11,
    total: 24,
    percent: 45.8,
    status: "BARRED",
    device: "Pixel 7"
  }];
  const filteredStudents = studentsMock.filter((s) => {
    if (selectedStudentFilter === "cleared") return s.status === "CLEARED";
    if (selectedStudentFilter === "barred") return s.status === "BARRED";
    return true;
  });
  const capabilities = [".XLSX & .CSV Ingest", ".DOCX & .PDF Parsing", "00XXXX Leading Zeros", "1-Phone Hardware Lock", "4-Digit In-Class PIN", "60% Exam Gate Matrix", "Printable Hall Slips", "Lecturer Audit Trail"];
  const policyModalContent = {
    title: "University Attendance Regulations & Exam Eligibility",
    subtitle: "Automated 60% Minimum Attendance Policy",
    content: /* @__PURE__ */ jsxs("div", {
      className: "space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed",
      children: [/* @__PURE__ */ jsxs("p", {
        children: ["Under university academic regulations, students are required to attain a minimum of ", /* @__PURE__ */ jsx("strong", {
          className: "text-white",
          children: "60% lecture and laboratory attendance"
        }), " to qualify to sit for semester examinations."]
      }), /* @__PURE__ */ jsxs("div", {
        className: "p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2",
        children: [/* @__PURE__ */ jsxs("h5", {
          className: "font-bold text-white flex items-center gap-2",
          children: [/* @__PURE__ */ jsx(Award, {
            className: "w-4 h-4 text-[#d7f837]"
          }), "Clearance Criteria:"]
        }), /* @__PURE__ */ jsxs("ul", {
          className: "list-disc pl-5 space-y-1 text-stone-400",
          children: [/* @__PURE__ */ jsx("li", {
            children: "Verified student attendance logs recorded per lecture session."
          }), /* @__PURE__ */ jsx("li", {
            children: "Complete date, time, and session duration tracking."
          }), /* @__PURE__ */ jsx("li", {
            children: "Hardware-backed anti-proxy defense preventing peer sign-ins."
          }), /* @__PURE__ */ jsx("li", {
            children: "Exportable official semester attendance matrix in Excel and signed PDF formats."
          })]
        })]
      }), /* @__PURE__ */ jsx("p", {
        children: "ClassMark automatically computes semester attendance percentages and separates eligible candidates from below-threshold students before examination hall lists are printed."
      })]
    })
  };
  const modalContents = {
    policy: policyModalContent,
    nuc: policyModalContent,
    exam: {
      title: "Semester Examination Clearance Engine",
      subtitle: "Automated Candidate Validation & Exam Hall Slips",
      content: /* @__PURE__ */ jsxs("div", {
        className: "space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed",
        children: [/* @__PURE__ */ jsx("p", {
          children: "ClassMark eliminates the chaotic manual tallying of attendance sign-in sheets before final exams."
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30",
            children: [/* @__PURE__ */ jsxs("span", {
              className: "font-bold text-emerald-400 text-xs flex items-center gap-1.5",
              children: [/* @__PURE__ */ jsx(CheckCircle2, {
                className: "w-3.5 h-3.5 text-emerald-400"
              }), "Eligible Candidates (≥ 60%)"]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-stone-300 mt-1",
              children: "Automatic clearance status with digital verification stamps and printable hall passes."
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30",
            children: [/* @__PURE__ */ jsxs("span", {
              className: "font-bold text-rose-400 text-xs flex items-center gap-1.5",
              children: [/* @__PURE__ */ jsx(AlertTriangle, {
                className: "w-3.5 h-3.5 text-rose-400"
              }), "Barred Candidates (< 60%)"]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-stone-300 mt-1",
              children: "Instant notification with complete breakdown of missed lectures and deficit calculations."
            })]
          })]
        }), /* @__PURE__ */ jsx("p", {
          children: "Department exam officers can generate printable official clearance rosters and departmental summary sheets with a single click."
        })]
      })
    },
    audit: {
      title: "Departmental Audit & Verification Trail",
      subtitle: "Immutable Session History & Verification Hashes",
      content: /* @__PURE__ */ jsxs("div", {
        className: "space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed",
        children: [/* @__PURE__ */ jsx("p", {
          children: "Every attendance session generated on ClassMark produces a cryptographically validated session ledger with ISO 8601 timestamps, lecturer credentials, and verified student check-in metadata."
        }), /* @__PURE__ */ jsxs("div", {
          className: "p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs font-mono text-stone-300",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(Check, {
              className: "w-3.5 h-3.5 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "GEO & Session IP Range Verification"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(Check, {
              className: "w-3.5 h-3.5 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "Unique Device Hardware Hash (UUID) Binding"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(Check, {
              className: "w-3.5 h-3.5 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "Single Check-In Per Physical Smartphone"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(Check, {
              className: "w-3.5 h-3.5 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "Immutable Audit Log for Faculty & Departmental Verification"
            })]
          })]
        })]
      })
    },
    security: {
      title: "Hardware Device-Locking Security Architecture",
      subtitle: "Zero-Tolerance Anti-Proxy Protection",
      content: /* @__PURE__ */ jsxs("div", {
        className: "space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed",
        children: [/* @__PURE__ */ jsx("p", {
          children: "Traditional paper sheets and static QR codes suffer from widespread proxy signing, where absent students share links via WhatsApp or peer sign-ins."
        }), /* @__PURE__ */ jsx("p", {
          className: "font-semibold text-white",
          children: "ClassMark's 3-Layer Defense:"
        }), /* @__PURE__ */ jsxs("ol", {
          className: "list-decimal pl-5 space-y-2 text-stone-300",
          children: [/* @__PURE__ */ jsxs("li", {
            children: [/* @__PURE__ */ jsx("strong", {
              className: "text-white",
              children: "Hardware Fingerprinting:"
            }), " Each student's device is cryptographically bound to their matriculation number upon first scan. One phone cannot check in for another student."]
          }), /* @__PURE__ */ jsxs("li", {
            children: [/* @__PURE__ */ jsx("strong", {
              className: "text-white",
              children: "Dynamic In-Class PIN:"
            }), " The lecturer announces or displays a randomized 4-digit code in the classroom that expires when the session ends."]
          }), /* @__PURE__ */ jsxs("li", {
            children: [/* @__PURE__ */ jsx("strong", {
              className: "text-white",
              children: "Session Expiry Windows:"
            }), " Sessions automatically close when the lecture concludes, stopping late proxy submissions."]
          })]
        })]
      })
    },
    privacy: {
      title: "Data Privacy & Institutional Protection",
      subtitle: "Student & Faculty Data Confidentiality Policy",
      content: /* @__PURE__ */ jsxs("div", {
        className: "space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed",
        children: [/* @__PURE__ */ jsx("p", {
          children: "ClassMark is committed to institutional data confidentiality. Student matriculation numbers, email addresses, and attendance records are processed solely for academic record-keeping and audit validation."
        }), /* @__PURE__ */ jsx("p", {
          children: "Data is encrypted in transit using TLS 1.3 and at rest with AES-256 standards. Student location or personal device identifiers are never shared with external commercial entities."
        })]
      })
    },
    terms: {
      title: "Academic Portal Terms of Service",
      subtitle: "University Lecturer & Staff Usage Agreement",
      content: /* @__PURE__ */ jsxs("div", {
        className: "space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed",
        children: [/* @__PURE__ */ jsx("p", {
          children: "By utilizing the ClassMark Academic Platform, authorized university faculty and staff agree to maintain academic record confidentiality and adhere to institutional grading and attendance regulations."
        }), /* @__PURE__ */ jsx("p", {
          children: "Any unauthorized tampering with student attendance percentages or falsification of exam clearance reports constitutes an academic violation subject to institutional disciplinary procedures."
        })]
      })
    },
    integrity: {
      title: "Zero-Tolerance Academic Integrity Policy",
      subtitle: "Defending Educational Excellence Across Campuses",
      content: /* @__PURE__ */ jsxs("div", {
        className: "space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed",
        children: [/* @__PURE__ */ jsx("p", {
          children: "Academic attendance is directly correlated with student competency, laboratory readiness, and graduation qualifications."
        }), /* @__PURE__ */ jsx("p", {
          children: "ClassMark enforces a zero-tolerance policy against proxy attendance fraud. Any attempt to spoof device hashes or distribute in-class check-in codes outside the physical lecture hall will trigger an automated security audit flag on the student's departmental file."
        })]
      })
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#08080a] text-[#f4f4f5] font-sans antialiased selection:bg-[#d7f837] selection:text-black relative overflow-x-hidden",
    children: [/* @__PURE__ */ jsx("div", {
      className: "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-radial from-[#d7f837]/10 via-emerald-500/5 to-transparent blur-[120px] pointer-events-none"
    }), /* @__PURE__ */ jsx("div", {
      className: "absolute top-[600px] right-0 w-[500px] h-[500px] bg-radial from-blue-600/5 to-transparent blur-[140px] pointer-events-none"
    }), /* @__PURE__ */ jsxs("div", {
      className: "max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 py-5 sm:py-7",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "sticky top-4 z-40 bg-[#0d0e12]/80 backdrop-blur-xl border border-white/[0.08] rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl",
        children: [/* @__PURE__ */ jsxs(Link, {
          to: "/",
          className: "flex items-center gap-2.5 group",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-8 h-8 rounded-full bg-[#16171d] border border-white/10 flex items-center justify-center group-hover:border-[#d7f837]/50 transition-colors shadow-sm",
            children: /* @__PURE__ */ jsx(GraduationCap, {
              className: "w-4 h-4 text-[#d7f837]"
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-extrabold tracking-tight text-white text-base sm:text-lg",
              children: "CLASSMARK"
            }), /* @__PURE__ */ jsx("span", {
              className: "px-1.5 py-0.5 rounded-full bg-[#d7f837]/15 text-[#d7f837] text-[10px] font-mono font-bold border border-[#d7f837]/30",
              children: "v2.4"
            })]
          })]
        }), /* @__PURE__ */ jsxs("nav", {
          className: "hidden md:flex items-center gap-6 text-xs font-medium text-stone-400",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "relative",
            onMouseEnter: () => setMegaMenuOpen(true),
            children: [/* @__PURE__ */ jsxs("button", {
              type: "button",
              onClick: () => setMegaMenuOpen(!megaMenuOpen),
              className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${megaMenuOpen ? "text-white bg-white/10" : "text-stone-300 hover:text-white hover:bg-white/5"}`,
              "aria-expanded": megaMenuOpen,
              children: [/* @__PURE__ */ jsx("span", {
                className: "font-semibold",
                children: "Platform"
              }), /* @__PURE__ */ jsx(ChevronDown, {
                className: `w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? "rotate-180 text-[#d7f837]" : "text-stone-400"}`
              })]
            }), megaMenuOpen && /* @__PURE__ */ jsxs(Fragment, {
              children: [/* @__PURE__ */ jsx("div", {
                className: "fixed inset-0 z-40",
                onClick: () => setMegaMenuOpen(false)
              }), /* @__PURE__ */ jsxs("div", {
                className: "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[620px] max-w-[90vw] bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-5 z-50 animate-in fade-in zoom-in-95 duration-150",
                onMouseLeave: () => setMegaMenuOpen(false),
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "grid grid-cols-2 gap-4",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [/* @__PURE__ */ jsx("div", {
                      className: "text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-2.5 pb-1",
                      children: "Core Capabilities"
                    }), /* @__PURE__ */ jsxs("a", {
                      href: "#cockpit",
                      onClick: () => {
                        setMegaMenuOpen(false);
                        setActiveTab("projector");
                      },
                      className: "flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "w-8 h-8 rounded-lg bg-[#d7f837]/10 border border-[#d7f837]/20 flex items-center justify-center text-[#d7f837] shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
                        children: /* @__PURE__ */ jsx(Radio, {
                          className: "w-4 h-4"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        children: [/* @__PURE__ */ jsxs("div", {
                          className: "text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors flex items-center gap-1.5",
                          children: [/* @__PURE__ */ jsx("span", {
                            children: "Live Projector Cockpit"
                          }), /* @__PURE__ */ jsx("span", {
                            className: "text-[9px] font-mono px-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                            children: "LIVE"
                          })]
                        }), /* @__PURE__ */ jsx("p", {
                          className: "text-[11px] text-stone-400 leading-snug mt-0.5",
                          children: "Dynamic in-hall QR code, classroom PIN & real-time counter."
                        })]
                      })]
                    }), /* @__PURE__ */ jsxs("a", {
                      href: "#security",
                      onClick: () => setMegaMenuOpen(false),
                      className: "flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
                        children: /* @__PURE__ */ jsx(Fingerprint, {
                          className: "w-4 h-4"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        children: [/* @__PURE__ */ jsx("div", {
                          className: "text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors",
                          children: "Device-Lock Shield"
                        }), /* @__PURE__ */ jsx("p", {
                          className: "text-[11px] text-stone-400 leading-snug mt-0.5",
                          children: "Cryptographic hardware binding stopping proxy attendance."
                        })]
                      })]
                    }), /* @__PURE__ */ jsxs("a", {
                      href: "#features",
                      onClick: () => setMegaMenuOpen(false),
                      className: "flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
                        children: /* @__PURE__ */ jsx(UploadCloud, {
                          className: "w-4 h-4"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        children: [/* @__PURE__ */ jsx("div", {
                          className: "text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors",
                          children: "Universal Roster Ingest"
                        }), /* @__PURE__ */ jsx("p", {
                          className: "text-[11px] text-stone-400 leading-snug mt-0.5",
                          children: "Ingests Excel, Word, PDF & CSV with leading zero fidelity."
                        })]
                      })]
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [/* @__PURE__ */ jsx("div", {
                      className: "text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-2.5 pb-1",
                      children: "Examination & Compliance"
                    }), /* @__PURE__ */ jsxs("button", {
                      type: "button",
                      onClick: () => {
                        setMegaMenuOpen(false);
                        setActiveTab("clearance");
                        const el = document.getElementById("cockpit");
                        if (el) el.scrollIntoView({
                          behavior: "smooth"
                        });
                      },
                      className: "w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group cursor-pointer",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
                        children: /* @__PURE__ */ jsx(Award, {
                          className: "w-4 h-4"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        children: [/* @__PURE__ */ jsxs("div", {
                          className: "text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors flex items-center gap-1.5",
                          children: [/* @__PURE__ */ jsx("span", {
                            children: "60% Exam Clearance"
                          }), /* @__PURE__ */ jsx("span", {
                            className: "text-[9px] font-mono px-1 rounded bg-[#d7f837]/15 text-[#d7f837]",
                            children: "60% RULE"
                          })]
                        }), /* @__PURE__ */ jsx("p", {
                          className: "text-[11px] text-stone-400 leading-snug mt-0.5",
                          children: "Automated eligible vs barred student matrix before exams."
                        })]
                      })]
                    }), /* @__PURE__ */ jsxs("button", {
                      type: "button",
                      onClick: () => {
                        setMegaMenuOpen(false);
                        setActiveModal("exam");
                      },
                      className: "w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group cursor-pointer",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "w-8 h-8 rounded-lg bg-[#d7f837]/10 border border-[#d7f837]/20 flex items-center justify-center text-[#d7f837] shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
                        children: /* @__PURE__ */ jsx(FileSpreadsheet, {
                          className: "w-4 h-4"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        children: [/* @__PURE__ */ jsx("div", {
                          className: "text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors",
                          children: "Official Exam Registers"
                        }), /* @__PURE__ */ jsx("p", {
                          className: "text-[11px] text-stone-400 leading-snug mt-0.5",
                          children: "1-click signed PDF rosters & multi-sheet Excel exports."
                        })]
                      })]
                    }), /* @__PURE__ */ jsxs("button", {
                      type: "button",
                      onClick: () => {
                        setMegaMenuOpen(false);
                        setActiveModal("audit");
                      },
                      className: "w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group cursor-pointer",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
                        children: /* @__PURE__ */ jsx(ShieldCheck, {
                          className: "w-4 h-4"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        children: [/* @__PURE__ */ jsx("div", {
                          className: "text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors",
                          children: "Tamper-Proof Audit Trail"
                        }), /* @__PURE__ */ jsx("p", {
                          className: "text-[11px] text-stone-400 leading-snug mt-0.5",
                          children: "Cryptographic session validation & manual override logs."
                        })]
                      })]
                    })]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-stone-400",
                  children: [/* @__PURE__ */ jsxs("span", {
                    className: "flex items-center gap-1.5",
                    children: [/* @__PURE__ */ jsx("span", {
                      className: "w-1.5 h-1.5 rounded-full bg-emerald-400"
                    }), /* @__PURE__ */ jsx("span", {
                      children: "60% Exam Policy Engine"
                    })]
                  }), /* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => {
                      setMegaMenuOpen(false);
                      setActiveModal("policy");
                    },
                    className: "text-[#d7f837] hover:underline font-semibold cursor-pointer",
                    children: "View Exam Clearance Policy →"
                  })]
                })]
              })]
            })]
          }), /* @__PURE__ */ jsx("a", {
            href: "#workflow",
            className: "hover:text-white transition-colors",
            children: "Workflow"
          }), /* @__PURE__ */ jsxs("button", {
            type: "button",
            onClick: () => setActiveModal("policy"),
            className: "hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-stone-300",
            children: [/* @__PURE__ */ jsx("span", {
              children: "Exam Policy"
            }), /* @__PURE__ */ jsx("span", {
              className: "w-1.5 h-1.5 rounded-full bg-emerald-400"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-2.5",
          children: [/* @__PURE__ */ jsx(Link, {
            to: "/register",
            className: "text-xs font-semibold text-stone-400 hover:text-white px-3 py-1.5 transition-colors hidden sm:inline-block",
            children: "Register"
          }), /* @__PURE__ */ jsxs(Link, {
            to: "/login",
            className: "inline-flex items-center gap-1.5 bg-[#d7f837] hover:bg-[#cbf028] text-black text-xs font-extrabold px-4 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(215,248,55,0.2)] hover:shadow-[0_0_25px_rgba(215,248,55,0.35)] active:scale-95",
            children: [/* @__PURE__ */ jsx(LogIn, {
              className: "w-3.5 h-3.5"
            }), /* @__PURE__ */ jsx("span", {
              children: "Sign In"
            })]
          }), /* @__PURE__ */ jsx("button", {
            type: "button",
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            className: "w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 md:hidden cursor-pointer",
            "aria-label": "Toggle navigation",
            children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, {
              className: "w-4 h-4"
            }) : /* @__PURE__ */ jsx(Menu, {
              className: "w-4 h-4"
            })
          })]
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "text-center space-y-6 pt-4 sm:pt-10",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-stone-300 shadow-inner",
          children: [/* @__PURE__ */ jsx("span", {
            className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-white font-semibold",
            children: "The University Attendance Operating System"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-stone-500",
            children: "·"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-[#d7f837] font-mono",
            children: "Zero Proxies"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "max-w-4xl mx-auto space-y-4",
          children: [/* @__PURE__ */ jsxs("h1", {
            className: "text-3xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-white leading-[1.08]",
            children: ["Automate lecture halls in 90 seconds. ", /* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("span", {
              className: "text-transparent bg-clip-text bg-gradient-to-r from-[#d7f837] via-emerald-300 to-teal-400",
              children: "Zero proxy fraud."
            })]
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm sm:text-base lg:text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed font-normal",
            children: "A high-performance attendance application for university lecturers. Ingest messy rosters in seconds, eliminate proxies with hardware device binding, and automate 60% examination clearance reports in 1 click."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-wrap items-center justify-center gap-3 pt-2",
          children: [/* @__PURE__ */ jsxs(Link, {
            to: "/register",
            className: "inline-flex items-center gap-2.5 bg-[#d7f837] hover:bg-[#cbf028] text-black text-sm font-extrabold px-6 py-3 rounded-full transition-all shadow-[0_0_30px_rgba(215,248,55,0.25)] hover:scale-[1.02] active:scale-[0.98]",
            children: [/* @__PURE__ */ jsx("span", {
              children: "Get Started as Lecturer"
            }), /* @__PURE__ */ jsx(ArrowRight, {
              className: "w-4 h-4"
            })]
          }), /* @__PURE__ */ jsxs(Link, {
            to: "/login",
            className: "inline-flex items-center gap-2 bg-[#121319] hover:bg-[#1a1b24] text-stone-200 border border-white/10 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:border-white/20",
            children: [/* @__PURE__ */ jsx(LogIn, {
              className: "w-4 h-4 text-stone-400"
            }), /* @__PURE__ */ jsx("span", {
              children: "Sign In to Workspace"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-stone-400",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [/* @__PURE__ */ jsx(Zap, {
              className: "w-3.5 h-3.5 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "90s Hall Processing"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "hidden sm:inline text-stone-700",
            children: "•"
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [/* @__PURE__ */ jsx(ShieldCheck, {
              className: "w-3.5 h-3.5 text-emerald-400"
            }), /* @__PURE__ */ jsx("span", {
              children: "Hardware-Locked UUID"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "hidden sm:inline text-stone-700",
            children: "•"
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [/* @__PURE__ */ jsx(FileCheck, {
              className: "w-3.5 h-3.5 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "100% Leading-Zero Integrity"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "hidden sm:inline text-stone-700",
            children: "•"
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [/* @__PURE__ */ jsx(Award, {
              className: "w-3.5 h-3.5 text-emerald-400"
            }), /* @__PURE__ */ jsx("span", {
              children: "60% Exam Threshold Engine"
            })]
          })]
        })]
      }), /* @__PURE__ */ jsx("section", {
        id: "cockpit",
        className: "scroll-mt-24",
        children: /* @__PURE__ */ jsxs("div", {
          className: "relative rounded-[24px] sm:rounded-[32px] bg-[#0d0e14] border border-white/[0.12] shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "px-4 py-3 bg-[#13141c] border-b border-white/[0.08] flex items-center justify-between",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2",
              children: [/* @__PURE__ */ jsx("span", {
                className: "w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40"
              }), /* @__PURE__ */ jsx("span", {
                className: "w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40"
              }), /* @__PURE__ */ jsx("span", {
                className: "w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40"
              }), /* @__PURE__ */ jsx("span", {
                className: "text-[11px] font-mono text-stone-400 ml-3 hidden sm:inline",
                children: "ClassMark Cockpit — CSC 201: Data Structures & Algorithms"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"
                }), /* @__PURE__ */ jsx("span", {
                  children: "SESSION ACTIVE"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "hidden sm:flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5",
                children: [/* @__PURE__ */ jsx(Clock, {
                  className: "w-3.5 h-3.5 text-stone-400"
                }), /* @__PURE__ */ jsx("span", {
                  children: demoTimeLeft
                })]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "px-4 py-2 bg-[#0a0b10] border-b border-white/[0.06] flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs",
            children: [/* @__PURE__ */ jsxs("button", {
              type: "button",
              onClick: () => setActiveTab("projector"),
              className: `px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "projector" ? "bg-[#d7f837] text-black shadow-sm font-bold" : "text-stone-400 hover:text-white hover:bg-white/5"}`,
              children: [/* @__PURE__ */ jsx(Radio, {
                className: "w-3.5 h-3.5"
              }), /* @__PURE__ */ jsx("span", {
                children: "Live QR Projector"
              })]
            }), /* @__PURE__ */ jsxs("button", {
              type: "button",
              onClick: () => setActiveTab("roster"),
              className: `px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "roster" ? "bg-[#d7f837] text-black shadow-sm font-bold" : "text-stone-400 hover:text-white hover:bg-white/5"}`,
              children: [/* @__PURE__ */ jsx(Users, {
                className: "w-3.5 h-3.5"
              }), /* @__PURE__ */ jsx("span", {
                children: "Live Register Feed"
              })]
            }), /* @__PURE__ */ jsxs("button", {
              type: "button",
              onClick: () => setActiveTab("clearance"),
              className: `px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "clearance" ? "bg-[#d7f837] text-black shadow-sm font-bold" : "text-stone-400 hover:text-white hover:bg-white/5"}`,
              children: [/* @__PURE__ */ jsx(Award, {
                className: "w-3.5 h-3.5"
              }), /* @__PURE__ */ jsx("span", {
                children: "60% Exam Clearance"
              })]
            }), /* @__PURE__ */ jsxs("button", {
              type: "button",
              onClick: () => setActiveTab("security"),
              className: `px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === "security" ? "bg-[#d7f837] text-black shadow-sm font-bold" : "text-stone-400 hover:text-white hover:bg-white/5"}`,
              children: [/* @__PURE__ */ jsx(Fingerprint, {
                className: "w-3.5 h-3.5"
              }), /* @__PURE__ */ jsx("span", {
                children: "Device-Lock Logs"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-4 sm:p-7 min-h-[420px] bg-[#0c0d13]",
            children: [activeTab === "projector" && /* @__PURE__ */ jsxs("div", {
              className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-center",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "lg:col-span-6 bg-[#12131b] rounded-2xl p-5 border border-white/10 flex flex-col items-center justify-center text-center space-y-4 shadow-xl",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "relative p-4 rounded-2xl bg-white shadow-2xl flex items-center justify-center",
                  children: [/* @__PURE__ */ jsx(QrCode, {
                    className: "w-48 h-48 sm:w-56 sm:h-56 text-[#09090b]"
                  }), /* @__PURE__ */ jsx("div", {
                    className: "absolute inset-0 flex items-center justify-center pointer-events-none",
                    children: /* @__PURE__ */ jsx("div", {
                      className: "w-10 h-10 rounded-xl bg-[#d7f837] text-black flex items-center justify-center font-black text-xs shadow-lg border-2 border-black",
                      children: "CM"
                    })
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "space-y-1",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "text-[11px] font-mono text-stone-400 uppercase tracking-widest",
                    children: "Classroom Anti-Remote PIN"
                  }), /* @__PURE__ */ jsx("div", {
                    className: "inline-block px-4 py-1.5 rounded-xl bg-black border border-white/10 text-[#d7f837] font-mono text-xl sm:text-2xl font-black tracking-widest shadow-inner",
                    children: "PIN: 8492"
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-[11px] text-stone-400 pt-1",
                    children: "Display on lecture hall projector. Students scan and verify in 3 seconds."
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "lg:col-span-6 space-y-5",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "bg-[#12131b] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between text-xs sm:text-sm font-semibold",
                    children: [/* @__PURE__ */ jsxs("span", {
                      className: "text-white flex items-center gap-2",
                      children: [/* @__PURE__ */ jsx(Users, {
                        className: "w-4 h-4 text-[#d7f837]"
                      }), /* @__PURE__ */ jsx("span", {
                        children: "Auditorium Sign-In Velocity"
                      })]
                    }), /* @__PURE__ */ jsxs("span", {
                      className: "text-[#d7f837] font-mono font-bold",
                      children: [demoTicker, " / 412 Verified (94.6%)"]
                    })]
                  }), /* @__PURE__ */ jsx("div", {
                    className: "w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden",
                    children: /* @__PURE__ */ jsx("div", {
                      className: "h-full bg-gradient-to-r from-emerald-500 to-[#d7f837] rounded-full transition-all duration-500",
                      style: {
                        width: `${demoTicker / 412 * 100}%`
                      }
                    })
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between text-[11px] font-mono text-stone-400",
                    children: [/* @__PURE__ */ jsx("span", {
                      children: "Speed: ~4.2 check-ins/sec"
                    }), /* @__PURE__ */ jsx("span", {
                      className: "text-emerald-400",
                      children: "0 Proxies Detected"
                    })]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "bg-[#12131b] rounded-2xl p-4 border border-white/10 space-y-2",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "text-[11px] font-mono uppercase tracking-wider text-stone-400 flex items-center justify-between",
                    children: [/* @__PURE__ */ jsx("span", {
                      children: "Live Hardware Handshake Log"
                    }), /* @__PURE__ */ jsxs("span", {
                      className: "text-emerald-400 flex items-center gap-1",
                      children: [/* @__PURE__ */ jsx("span", {
                        className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"
                      }), "Streaming"]
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1.5",
                    children: [/* @__PURE__ */ jsxs("div", {
                      className: "p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono",
                      children: [/* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold",
                        children: "001429 · Adebayo K."
                      }), /* @__PURE__ */ jsx("span", {
                        className: "text-stone-400 text-[11px]",
                        children: "iPhone 14 Pro"
                      }), /* @__PURE__ */ jsx("span", {
                        className: "text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20",
                        children: "UUID BOUND ✓"
                      })]
                    }), /* @__PURE__ */ jsxs("div", {
                      className: "p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono",
                      children: [/* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold",
                        children: "001580 · Okafor C."
                      }), /* @__PURE__ */ jsx("span", {
                        className: "text-stone-400 text-[11px]",
                        children: "Galaxy S23"
                      }), /* @__PURE__ */ jsx("span", {
                        className: "text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20",
                        children: "UUID BOUND ✓"
                      })]
                    }), /* @__PURE__ */ jsxs("div", {
                      className: "p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono",
                      children: [/* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold",
                        children: "001715 · Balogun A."
                      }), /* @__PURE__ */ jsx("span", {
                        className: "text-stone-400 text-[11px]",
                        children: "iPhone 13"
                      }), /* @__PURE__ */ jsx("span", {
                        className: "text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20",
                        children: "UUID BOUND ✓"
                      })]
                    })]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-3",
                  children: [/* @__PURE__ */ jsxs(Link, {
                    to: "/register",
                    className: "flex-1 py-2.5 px-4 rounded-xl bg-[#d7f837] hover:bg-[#cbf028] text-black font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer",
                    children: [/* @__PURE__ */ jsx("span", {
                      children: "Start Session on ClassMark"
                    }), /* @__PURE__ */ jsx(ArrowRight, {
                      className: "w-3.5 h-3.5"
                    })]
                  }), /* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => setActiveModal("security"),
                    className: "py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-semibold text-xs border border-white/10 cursor-pointer",
                    children: "Security Protocol"
                  })]
                })]
              })]
            }), activeTab === "roster" && /* @__PURE__ */ jsxs("div", {
              className: "space-y-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]",
                children: [/* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("h4", {
                    className: "text-sm font-bold text-white",
                    children: "Enrolled Class Roster — CSC 201 (412 Students)"
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-xs text-stone-400",
                    children: "100% Leading-zero preserved. Instant real-time search & manual lecturer override audit."
                  })]
                }), /* @__PURE__ */ jsx("div", {
                  className: "flex items-center gap-2",
                  children: /* @__PURE__ */ jsxs("div", {
                    className: "relative",
                    children: [/* @__PURE__ */ jsx(Search, {
                      className: "w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                    }), /* @__PURE__ */ jsx("input", {
                      type: "text",
                      readOnly: true,
                      value: "Filter: 0014...",
                      className: "bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-stone-300 font-mono focus:outline-none"
                    })]
                  })
                })]
              }), /* @__PURE__ */ jsx("div", {
                className: "overflow-x-auto",
                children: /* @__PURE__ */ jsxs("table", {
                  className: "w-full text-left text-xs font-mono",
                  children: [/* @__PURE__ */ jsx("thead", {
                    children: /* @__PURE__ */ jsxs("tr", {
                      className: "border-b border-white/[0.08] text-stone-400 text-[11px] uppercase",
                      children: [/* @__PURE__ */ jsx("th", {
                        className: "py-2.5 px-3",
                        children: "Matric No"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "py-2.5 px-3",
                        children: "Student Name"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "py-2.5 px-3",
                        children: "Attendance"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "py-2.5 px-3",
                        children: "Hardware Lock"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "py-2.5 px-3",
                        children: "Audit Action"
                      })]
                    })
                  }), /* @__PURE__ */ jsx("tbody", {
                    className: "divide-y divide-white/[0.04]",
                    children: studentsMock.map((student, i) => /* @__PURE__ */ jsxs("tr", {
                      className: "hover:bg-white/[0.02] transition-colors",
                      children: [/* @__PURE__ */ jsx("td", {
                        className: "py-2.5 px-3 font-bold text-[#d7f837]",
                        children: student.matric
                      }), /* @__PURE__ */ jsx("td", {
                        className: "py-2.5 px-3 text-white font-sans font-medium",
                        children: student.name
                      }), /* @__PURE__ */ jsx("td", {
                        className: "py-2.5 px-3",
                        children: /* @__PURE__ */ jsxs("span", {
                          className: "text-stone-300",
                          children: [student.attended, "/", student.total, " (", student.percent, "%)"]
                        })
                      }), /* @__PURE__ */ jsx("td", {
                        className: "py-2.5 px-3",
                        children: /* @__PURE__ */ jsxs("span", {
                          className: "inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-sans font-semibold",
                          children: [/* @__PURE__ */ jsx(Check, {
                            className: "w-3 h-3"
                          }), student.device]
                        })
                      }), /* @__PURE__ */ jsx("td", {
                        className: "py-2.5 px-3",
                        children: /* @__PURE__ */ jsx("button", {
                          type: "button",
                          onClick: () => setActiveModal("audit"),
                          className: "text-[11px] text-stone-400 hover:text-white underline cursor-pointer",
                          children: "Override with Reason"
                        })
                      })]
                    }, i))
                  })]
                })
              })]
            }), activeTab === "clearance" && /* @__PURE__ */ jsxs("div", {
              className: "space-y-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]",
                children: [/* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsxs("h4", {
                    className: "text-sm font-bold text-white flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx("span", {
                      children: "University Examination Clearance Engine"
                    }), /* @__PURE__ */ jsx("span", {
                      className: "px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono",
                      children: "THRESHOLD: 60%"
                    })]
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-xs text-stone-400",
                    children: "Automatically partitions eligible candidates from barred students based on the 60% benchmark."
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [/* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => setSelectedStudentFilter("all"),
                    className: `px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${selectedStudentFilter === "all" ? "bg-white text-black font-bold" : "text-stone-400 hover:text-white"}`,
                    children: "All (5)"
                  }), /* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => setSelectedStudentFilter("cleared"),
                    className: `px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${selectedStudentFilter === "cleared" ? "bg-emerald-500 text-black font-bold" : "text-stone-400 hover:text-white"}`,
                    children: "Cleared (4)"
                  }), /* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => setSelectedStudentFilter("barred"),
                    className: `px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${selectedStudentFilter === "barred" ? "bg-rose-500 text-white font-bold" : "text-stone-400 hover:text-white"}`,
                    children: "Barred (1)"
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "p-3.5 rounded-xl bg-white/[0.03] border border-white/10",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "text-[10px] uppercase font-mono text-stone-400",
                    children: "Total Lectures Conducted"
                  }), /* @__PURE__ */ jsx("div", {
                    className: "text-xl font-bold text-white mt-1",
                    children: "24 Sessions"
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "text-[10px] uppercase font-mono text-emerald-400",
                    children: "Cleared for Examination"
                  }), /* @__PURE__ */ jsx("div", {
                    className: "text-xl font-bold text-emerald-300 mt-1",
                    children: "372 Candidates (90.3%)"
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "text-[10px] uppercase font-mono text-rose-400",
                    children: "Barred (< 60% Attendance)"
                  }), /* @__PURE__ */ jsx("div", {
                    className: "text-xl font-bold text-rose-300 mt-1",
                    children: "40 Candidates (9.7%)"
                  })]
                })]
              }), /* @__PURE__ */ jsx("div", {
                className: "space-y-1.5",
                children: filteredStudents.map((st, idx) => /* @__PURE__ */ jsxs("div", {
                  className: "p-2.5 rounded-xl bg-[#12131b] border border-white/5 flex items-center justify-between text-xs font-mono",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [/* @__PURE__ */ jsx("span", {
                      className: "font-bold text-[#d7f837]",
                      children: st.matric
                    }), /* @__PURE__ */ jsx("span", {
                      className: "text-white font-sans",
                      children: st.name
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [/* @__PURE__ */ jsxs("span", {
                      className: "text-stone-400",
                      children: [st.attended, "/", st.total, " (", st.percent, "%)"]
                    }), st.status === "CLEARED" ? /* @__PURE__ */ jsx("span", {
                      className: "px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold",
                      children: "CLEARED FOR EXAM ✓"
                    }) : /* @__PURE__ */ jsx("span", {
                      className: "px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold",
                      children: "BARRED (< 60%) ✕"
                    })]
                  })]
                }, idx))
              }), /* @__PURE__ */ jsxs("div", {
                className: "pt-2 flex flex-wrap items-center gap-3",
                children: [/* @__PURE__ */ jsxs("button", {
                  type: "button",
                  onClick: () => setActiveModal("exam"),
                  className: "px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs flex items-center gap-2 hover:bg-stone-200 transition-colors cursor-pointer",
                  children: [/* @__PURE__ */ jsx(Download, {
                    className: "w-3.5 h-3.5"
                  }), /* @__PURE__ */ jsx("span", {
                    children: "Download Exam Clearance PDF"
                  })]
                }), /* @__PURE__ */ jsxs("button", {
                  type: "button",
                  onClick: () => setActiveModal("policy"),
                  className: "px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 text-xs font-semibold flex items-center gap-2 cursor-pointer",
                  children: [/* @__PURE__ */ jsx(FileSpreadsheet, {
                    className: "w-3.5 h-3.5 text-[#d7f837]"
                  }), /* @__PURE__ */ jsx("span", {
                    children: "Export Multi-Sheet Excel Matrix"
                  })]
                })]
              })]
            }), activeTab === "security" && /* @__PURE__ */ jsxs("div", {
              className: "space-y-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "pb-2 border-b border-white/[0.06]",
                children: [/* @__PURE__ */ jsxs("h4", {
                  className: "text-sm font-bold text-white flex items-center gap-2",
                  children: [/* @__PURE__ */ jsx(Fingerprint, {
                    className: "w-4 h-4 text-[#d7f837]"
                  }), /* @__PURE__ */ jsx("span", {
                    children: "Hardware Fingerprint Security Protocol"
                  })]
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-xs text-stone-400",
                  children: "Cryptographic binding blocks students from signing in for friends via WhatsApp links."
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "p-4 rounded-xl bg-[#12131b] border border-white/10 space-y-2",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "text-xs font-bold text-white flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx(ShieldCheck, {
                      className: "w-4 h-4 text-emerald-400"
                    }), /* @__PURE__ */ jsx("span", {
                      children: "1 Device = 1 Matric Number"
                    })]
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-xs text-stone-400 leading-relaxed",
                    children: "On first scan, the student's device hardware signature is bound to their matriculation profile. If another student attempts to use the same phone, the scan is rejected instantly."
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "p-4 rounded-xl bg-[#12131b] border border-white/10 space-y-2",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "text-xs font-bold text-white flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx(Lock, {
                      className: "w-4 h-4 text-[#d7f837]"
                    }), /* @__PURE__ */ jsx("span", {
                      children: "Dynamic Hall PIN Protection"
                    })]
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-xs text-stone-400 leading-relaxed",
                    children: "A dynamic 4-digit code is generated and projected inside the hall. Absent students cannot check in remotely even if a peer takes a photo of the QR code."
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "p-3.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px] text-stone-400 space-y-1",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "text-stone-300 font-bold",
                  children: "Latest Security Handshake Audit:"
                }), /* @__PURE__ */ jsx("div", {
                  className: "text-emerald-400",
                  children: "✓ SHA-256 Hardware Token Verified: Device-8f3a92...b2c9"
                }), /* @__PURE__ */ jsx("div", {
                  className: "text-emerald-400",
                  children: "✓ In-Hall Session Window Active (Expiry: 04:18)"
                }), /* @__PURE__ */ jsx("div", {
                  className: "text-emerald-400",
                  children: "✓ 0 Duplicate Hardware MAC Claims Detected"
                })]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "px-4 py-2 bg-[#09090e] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-stone-400",
            children: [/* @__PURE__ */ jsxs("span", {
              className: "flex items-center gap-1.5",
              children: [/* @__PURE__ */ jsx("span", {
                className: "w-2 h-2 rounded-full bg-emerald-400"
              }), /* @__PURE__ */ jsx("span", {
                children: "ClassMark Engine v2.4 (Active)"
              })]
            }), /* @__PURE__ */ jsx("span", {
              children: "60% Examination Policy Compliant"
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("section", {
        className: "space-y-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "text-center max-w-2xl mx-auto space-y-1.5",
          children: [/* @__PURE__ */ jsx("span", {
            className: "text-[11px] font-mono uppercase tracking-widest text-[#d7f837]",
            children: "Student Experience"
          }), /* @__PURE__ */ jsx("h2", {
            className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-white",
            children: "Zero App Installs Required for Students"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs sm:text-sm text-stone-400",
            children: "Students simply open their mobile camera, scan the projector screen, and check in via browser in 3 seconds."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-3 gap-4",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "p-6 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-3 hover:border-white/20 transition-all",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d7f837] font-mono font-bold",
              children: "01"
            }), /* @__PURE__ */ jsx("h3", {
              className: "font-bold text-base text-white",
              children: "Scan Projector QR"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-stone-400 leading-relaxed",
              children: "Student points smartphone camera at the projected dynamic QR code in the auditorium."
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-6 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-3 hover:border-white/20 transition-all",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d7f837] font-mono font-bold",
              children: "02"
            }), /* @__PURE__ */ jsx("h3", {
              className: "font-bold text-base text-white",
              children: "Enter Matric & PIN"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-stone-400 leading-relaxed",
              children: "Inputs matriculation number and the randomized 4-digit classroom code displayed on the screen."
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-6 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-3 hover:border-white/20 transition-all",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-mono font-bold",
              children: "03"
            }), /* @__PURE__ */ jsx("h3", {
              className: "font-bold text-base text-white",
              children: "Hardware Locked"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-stone-400 leading-relaxed",
              children: "Device hardware locks permanently to the matric number. Verified check-in is logged to the lecturer instantly."
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("section", {
        id: "features",
        className: "space-y-8 scroll-mt-24",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "text-center max-w-2xl mx-auto space-y-1.5",
          children: [/* @__PURE__ */ jsx("span", {
            className: "text-[11px] font-mono uppercase tracking-widest text-[#d7f837]",
            children: "Product Modules"
          }), /* @__PURE__ */ jsx("h2", {
            className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-white",
            children: "Built Like a High-Performance SaaS"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs sm:text-sm text-stone-400",
            children: "Every detail engineered to handle 500-seat lecture halls without delays, crashed sheets, or corrupted data."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-[#d7f837]/10 border border-[#d7f837]/20 flex items-center justify-center text-[#d7f837]",
              children: /* @__PURE__ */ jsx(UploadCloud, {
                className: "w-5 h-5"
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-1",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "text-lg font-bold text-white",
                children: "Universal Roster File Ingestion"
              }), /* @__PURE__ */ jsxs("p", {
                className: "text-xs text-stone-400 leading-relaxed",
                children: ["Directly parses rosters from Excel (.xlsx), CSV, Word (.docx), and PDF files. Preserves matriculation leading zeros (", /* @__PURE__ */ jsx("code", {
                  className: "text-[#d7f837] bg-white/5 px-1 py-0.5 rounded",
                  children: "004128"
                }), ") without spreadsheet corruption."]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1",
              children: [/* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Auto-detects matric & name columns"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Tolerates messy departmental formats"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Ingests 2,000 students in 0.4 seconds"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400",
              children: /* @__PURE__ */ jsx(ShieldCheck, {
                className: "w-5 h-5"
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-1",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "text-lg font-bold text-white",
                children: "Hardware Device-Locking Defense"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-xs text-stone-400 leading-relaxed",
                children: "Cryptographically locks each student's physical phone hardware fingerprint to their matric number. One smartphone cannot sign in for multiple students, permanently stopping lecture proxies."
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1",
              children: [/* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Cryptographic UUID binding"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Zero duplicate smartphone check-ins"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Full anti-spoofing audit detection"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400",
              children: /* @__PURE__ */ jsx(BarChart3, {
                className: "w-5 h-5"
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-1",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "text-lg font-bold text-white",
                children: "Automated 60% Examination Clearance Engine"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-xs text-stone-400 leading-relaxed",
                children: "Eliminates weeks of manual attendance tallying before examinations. Instantly computes cumulative percentage per student against the 60% university exam qualification threshold."
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1",
              children: [/* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Automated barred candidate roster (< 60%)"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Printable examination eligibility slips"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Pre-exam clearance verified in 1 second"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400",
              children: /* @__PURE__ */ jsx(FileText, {
                className: "w-5 h-5"
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-1",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "text-lg font-bold text-white",
                children: "Official Exam Registers & Excel Matrices"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-xs text-stone-400 leading-relaxed",
                children: "Export complete semester registers, attendance matrices, and summary reports formatted directly for faculty boards, heads of department, and exam officers."
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1",
              children: [/* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Multi-sheet Excel attendance matrices"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Official signed PDF format for exam halls"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-emerald-400",
                children: "✓ Complete manual override audit logs"
              })]
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "py-4 space-y-4",
        children: [/* @__PURE__ */ jsx("div", {
          className: "text-center",
          children: /* @__PURE__ */ jsx("span", {
            className: "text-[10px] font-mono uppercase tracking-widest text-stone-500",
            children: "Battle-Tested Architecture Built for University Realities"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5",
          children: capabilities.map((cap, index) => /* @__PURE__ */ jsx("div", {
            className: "bg-[#0f1017] hover:bg-[#151620] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center flex items-center justify-center text-[10px] font-mono text-stone-300 shadow-sm transition-all cursor-default hover:border-[#d7f837]/30",
            children: /* @__PURE__ */ jsx("span", {
              children: cap
            })
          }, index))
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#14151f] to-[#0c0d14] border border-white/10 p-7 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl",
        children: [/* @__PURE__ */ jsx("div", {
          className: "absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-radial from-[#d7f837]/15 to-transparent blur-3xl pointer-events-none"
        }), /* @__PURE__ */ jsxs("div", {
          className: "max-w-2xl mx-auto space-y-3 relative z-10",
          children: [/* @__PURE__ */ jsx("span", {
            className: "px-3 py-1 rounded-full bg-[#d7f837]/10 border border-[#d7f837]/20 text-[#d7f837] text-xs font-mono font-bold",
            children: "Ready for Deployment"
          }), /* @__PURE__ */ jsx("h2", {
            className: "text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight",
            children: "Bring Modern Attendance Infrastructure to Your Faculty."
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs sm:text-sm text-stone-400 leading-relaxed",
            children: "Join forward-thinking lecturers, deans, and exam officers transforming lecture halls with zero proxies and instant 60% exam clearance."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2",
          children: [/* @__PURE__ */ jsxs(Link, {
            to: "/register",
            className: "inline-flex items-center gap-2.5 bg-[#d7f837] hover:bg-[#cbf028] text-black text-sm font-extrabold px-6 py-3 rounded-full transition-all shadow-[0_0_25px_rgba(215,248,55,0.25)] hover:scale-[1.02] active:scale-[0.98]",
            children: [/* @__PURE__ */ jsx("span", {
              children: "Create Free Lecturer Account"
            }), /* @__PURE__ */ jsx(ArrowRight, {
              className: "w-4 h-4"
            })]
          }), /* @__PURE__ */ jsx(Link, {
            to: "/login",
            className: "inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 text-sm font-semibold px-6 py-3 rounded-full transition-all",
            children: /* @__PURE__ */ jsx("span", {
              children: "Sign In to Workspace"
            })
          })]
        })]
      }), /* @__PURE__ */ jsxs("footer", {
        className: "pt-10 pb-8 border-t border-white/[0.08] space-y-8",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-xs",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "lg:col-span-2 space-y-3",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2",
              children: [/* @__PURE__ */ jsx("div", {
                className: "w-7 h-7 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-xs",
                children: /* @__PURE__ */ jsx(GraduationCap, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("span", {
                className: "font-extrabold text-white text-base tracking-tight",
                children: "CLASSMARK"
              })]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-stone-400 text-xs leading-relaxed max-w-sm",
              children: "Production-grade university attendance infrastructure. Designed for Nigerian universities and tertiary institutions."
            }), /* @__PURE__ */ jsxs("div", {
              className: "pt-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5",
              children: [/* @__PURE__ */ jsx("span", {
                className: "w-1.5 h-1.5 rounded-full bg-emerald-400"
              }), /* @__PURE__ */ jsx("span", {
                children: "60% Exam Benchmark Compliant"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx("div", {
              className: "font-bold text-white uppercase text-[11px] tracking-wider",
              children: "Product"
            }), /* @__PURE__ */ jsxs("ul", {
              className: "space-y-1.5 text-stone-400",
              children: [/* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("a", {
                  href: "#cockpit",
                  className: "hover:text-white transition-colors",
                  children: "Live QR Projector"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("a", {
                  href: "#features",
                  className: "hover:text-white transition-colors",
                  children: "Universal Roster Ingest"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("a", {
                  href: "#security",
                  className: "hover:text-white transition-colors",
                  children: "Device-Lock Shield"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("a", {
                  href: "#cockpit",
                  className: "hover:text-white transition-colors",
                  children: "60% Attendance Matrix"
                })
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx("div", {
              className: "font-bold text-white uppercase text-[11px] tracking-wider",
              children: "Lecturers"
            }), /* @__PURE__ */ jsxs("ul", {
              className: "space-y-1.5 text-stone-400",
              children: [/* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx(Link, {
                  to: "/login",
                  className: "hover:text-white transition-colors",
                  children: "Workspace Sign In"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx(Link, {
                  to: "/register",
                  className: "hover:text-white transition-colors",
                  children: "Create Account"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx(Link, {
                  to: "/reset-password",
                  className: "hover:text-white transition-colors",
                  children: "Password Reset"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("a", {
                  href: "#workflow",
                  className: "hover:text-white transition-colors",
                  children: "Lecturer Flow Guide"
                })
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx("div", {
              className: "font-bold text-white uppercase text-[11px] tracking-wider",
              children: "Compliance & Regulations"
            }), /* @__PURE__ */ jsxs("ul", {
              className: "space-y-1.5 text-stone-400",
              children: [/* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setActiveModal("policy"),
                  className: "hover:text-[#d7f837] text-left transition-colors cursor-pointer",
                  children: "Exam Clearance Policy"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setActiveModal("exam"),
                  className: "hover:text-[#d7f837] text-left transition-colors cursor-pointer",
                  children: "Exam Clearance Slips"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setActiveModal("audit"),
                  className: "hover:text-[#d7f837] text-left transition-colors cursor-pointer",
                  children: "Departmental Audits"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setActiveModal("security"),
                  className: "hover:text-[#d7f837] text-left transition-colors cursor-pointer",
                  children: "Device Security Specs"
                })
              })]
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-mono",
          children: [/* @__PURE__ */ jsx("div", {
            children: "© 2026 ClassMark Attendance Platform. All rights reserved."
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-6",
            children: [/* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => setActiveModal("privacy"),
              className: "hover:text-white transition-colors cursor-pointer",
              children: "Privacy Policy"
            }), /* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => setActiveModal("terms"),
              className: "hover:text-white transition-colors cursor-pointer",
              children: "Terms of Service"
            }), /* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => setActiveModal("integrity"),
              className: "hover:text-white transition-colors cursor-pointer",
              children: "Academic Integrity"
            })]
          })]
        })]
      })]
    }), activeModal && modalContents[activeModal] && /* @__PURE__ */ jsxs("div", {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      children: [/* @__PURE__ */ jsx("div", {
        className: "fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity",
        onClick: () => setActiveModal(null)
      }), /* @__PURE__ */ jsxs("div", {
        className: "relative w-full max-w-lg bg-[#0e0f16] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-start justify-between pb-3 border-b border-white/[0.08]",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("h3", {
              className: "text-base font-bold text-white tracking-tight",
              children: modalContents[activeModal].title
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-stone-400 font-medium mt-0.5",
              children: modalContents[activeModal].subtitle
            })]
          }), /* @__PURE__ */ jsx("button", {
            type: "button",
            onClick: () => setActiveModal(null),
            className: "w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-300 cursor-pointer",
            "aria-label": "Close dialog",
            children: /* @__PURE__ */ jsx(X, {
              className: "w-3.5 h-3.5"
            })
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "max-h-[60vh] overflow-y-auto pr-1",
          children: modalContents[activeModal].content
        }), /* @__PURE__ */ jsx("div", {
          className: "pt-3 border-t border-white/[0.08] flex justify-end",
          children: /* @__PURE__ */ jsx("button", {
            type: "button",
            onClick: () => setActiveModal(null),
            className: "px-4 py-2 rounded-xl bg-[#d7f837] hover:bg-[#cbf028] text-black text-xs font-bold transition-all shadow-xs cursor-pointer",
            children: "Close Window"
          })
        })]
      })]
    }), mobileMenuOpen && /* @__PURE__ */ jsxs("div", {
      className: "fixed inset-0 z-50 flex",
      children: [/* @__PURE__ */ jsx("div", {
        className: "fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity",
        onClick: closeMenu
      }), /* @__PURE__ */ jsxs("div", {
        className: "relative ml-auto w-80 max-w-[85vw] bg-[#0c0d14] border-l border-white/10 shadow-2xl flex flex-col h-full z-10 p-6 space-y-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-center justify-between pb-4 border-b border-white/[0.08]",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-7 h-7 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-xs",
              children: /* @__PURE__ */ jsx(GraduationCap, {
                className: "w-3.5 h-3.5"
              })
            }), /* @__PURE__ */ jsx("span", {
              className: "font-extrabold text-white text-sm",
              children: "CLASSMARK"
            })]
          }), /* @__PURE__ */ jsx("button", {
            type: "button",
            onClick: closeMenu,
            className: "w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 cursor-pointer",
            "aria-label": "Close navigation",
            children: /* @__PURE__ */ jsx(X, {
              className: "w-3.5 h-3.5"
            })
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "space-y-2",
          children: [/* @__PURE__ */ jsxs(Link, {
            to: "/login",
            onClick: closeMenu,
            className: "w-full py-2.5 px-4 rounded-xl bg-[#d7f837] text-black text-xs font-extrabold text-center flex items-center justify-center gap-2 shadow-sm",
            children: [/* @__PURE__ */ jsx(LogIn, {
              className: "w-4 h-4"
            }), /* @__PURE__ */ jsx("span", {
              children: "Sign In"
            })]
          }), /* @__PURE__ */ jsxs(Link, {
            to: "/register",
            onClick: closeMenu,
            className: "w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-stone-200 text-xs font-semibold text-center flex items-center justify-center gap-2 hover:bg-white/10",
            children: [/* @__PURE__ */ jsx(UserPlus, {
              className: "w-4 h-4 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "Create Free Account"
            })]
          })]
        }), /* @__PURE__ */ jsxs("nav", {
          className: "flex-1 space-y-3 text-sm font-medium text-stone-300 pt-2",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "space-y-1",
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-3",
              children: "Platform"
            }), /* @__PURE__ */ jsx("a", {
              href: "#cockpit",
              onClick: () => {
                closeMenu();
                setActiveTab("projector");
              },
              className: "block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors",
              children: "Live QR Cockpit"
            }), /* @__PURE__ */ jsx("a", {
              href: "#security",
              onClick: closeMenu,
              className: "block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors",
              children: "Device-Lock Shield"
            }), /* @__PURE__ */ jsx("a", {
              href: "#features",
              onClick: closeMenu,
              className: "block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors",
              children: "Universal Roster Ingest"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-1 pt-2 border-t border-white/[0.06]",
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-3",
              children: "Compliance & Regulations"
            }), /* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => {
                closeMenu();
                setActiveModal("policy");
              },
              className: "block w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-stone-300 cursor-pointer",
              children: "Exam Clearance Policy"
            }), /* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => {
                closeMenu();
                setActiveModal("exam");
              },
              className: "block w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-stone-300 cursor-pointer",
              children: "Exam Clearance Slips"
            }), /* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => {
                closeMenu();
                setActiveModal("audit");
              },
              className: "block w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-stone-300 cursor-pointer",
              children: "Departmental Audit"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2 border-t border-white/[0.06]",
            children: /* @__PURE__ */ jsx("a", {
              href: "#workflow",
              onClick: closeMenu,
              className: "block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors",
              children: "4-Step Workflow"
            })
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "text-[11px] font-mono text-stone-500 pt-4 border-t border-white/[0.08]",
          children: "v2.4 Production Academic Portal"
        })]
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  loader: loader$f
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatDate(date, options) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options
  }).format(d);
}
function formatDateTime(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}
const Button = React.forwardRef(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    const variantStyles = {
      primary: "bg-[#111111] text-white hover:bg-black active:bg-stone-900 shadow-xs rounded-full hover:scale-[1.01] active:scale-[0.99]",
      accent: "bg-[#d7f837] text-black hover:bg-[#cbf028] active:bg-[#bedf20] font-bold rounded-full shadow-xs hover:scale-[1.01] active:scale-[0.99]",
      secondary: "bg-[#edebe4] text-stone-900 hover:bg-[#e4e2db] active:bg-[#dbd9d2] rounded-full",
      outline: "border border-black/[0.12] bg-white text-stone-800 hover:bg-[#faf9f5] active:bg-[#f0eee8] rounded-full shadow-2xs",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs rounded-full",
      ghost: "text-stone-600 hover:text-stone-900 hover:bg-black/5 rounded-full"
    };
    const sizeStyles = {
      sm: "h-8 px-3.5 text-xs gap-1.5",
      md: "h-9 px-4 text-xs sm:text-sm gap-2",
      lg: "h-11 px-6 text-sm sm:text-base gap-2.5"
    };
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref,
        disabled: disabled || isLoading,
        className: cn(baseStyles, variantStyles[variant], sizeStyles[size], className),
        ...props,
        children: [
          isLoading && /* @__PURE__ */ jsxs(
            "svg",
            {
              className: "animate-spin -ml-1 mr-2 h-4 w-4 text-current",
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx(
                  "path",
                  {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  }
                )
              ]
            }
          ),
          children
        ]
      }
    );
  }
);
Button.displayName = "Button";
async function loader$e({
  request
}) {
  const user = await getUser(request);
  if (user) {
    throw redirect("/dashboard");
  }
  return null;
}
const login = UNSAFE_withComponentProps(function LoginPage() {
  useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setUnverifiedEmail(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.unverified) {
          setUnverifiedEmail(data.email || email);
        }
        setErrorMessage(data.error || "Failed to sign in. Please verify your email and password.");
        setIsLoading(false);
        return;
      }
      setSuccessMessage("Authentication successful! Entering your lecturer portal...");
      window.location.href = from;
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#faf9f5] text-[#161616] font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#d7f837] selection:text-black",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3",
      children: [/* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "inline-flex items-center gap-2.5 focus:outline-none group",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform",
          children: /* @__PURE__ */ jsx(GraduationCap, {
            className: "w-5 h-5 text-[#d7f837]"
          })
        }), /* @__PURE__ */ jsx("span", {
          className: "font-extrabold text-[#111111] tracking-tight text-2xl",
          children: "CLASSMARK"
        }), /* @__PURE__ */ jsx("span", {
          className: "w-2 h-2 rounded-full bg-[#d7f837]"
        })]
      }), /* @__PURE__ */ jsx("h2", {
        className: "text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]",
        children: "Sign In"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto",
        children: "Manage university course registers, anti-proxy QR sessions, and semester reports"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]",
        children: [successMessage && /* @__PURE__ */ jsxs("div", {
          className: "mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center gap-3",
          children: [/* @__PURE__ */ jsx(CheckCircle2, {
            className: "w-5 h-5 text-emerald-600 shrink-0"
          }), /* @__PURE__ */ jsx("div", {
            className: "flex-1 text-xs font-semibold",
            children: successMessage
          })]
        }), errorMessage && /* @__PURE__ */ jsxs("div", {
          className: "mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800 flex items-start gap-3",
          children: [/* @__PURE__ */ jsx(AlertCircle, {
            className: "w-5 h-5 text-rose-600 shrink-0 mt-0.5"
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex-1 text-xs leading-relaxed",
            children: [/* @__PURE__ */ jsx("p", {
              className: "font-semibold",
              children: errorMessage
            }), unverifiedEmail && /* @__PURE__ */ jsx("p", {
              className: "mt-1.5 text-stone-600 font-medium",
              children: "Please check your institutional email inbox for your verification link."
            }), /* @__PURE__ */ jsxs("p", {
              className: "mt-2 text-rose-700",
              children: ["Don't have an account yet?", " ", /* @__PURE__ */ jsx(Link, {
                to: "/register",
                className: "font-bold underline hover:text-rose-900",
                children: "Register an account"
              })]
            })]
          })]
        }), /* @__PURE__ */ jsxs("form", {
          className: "space-y-4",
          onSubmit: handleSubmit,
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "email",
              className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
              children: "Institutional Email"
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-1.5 relative",
              children: [/* @__PURE__ */ jsx("div", {
                className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                children: /* @__PURE__ */ jsx(Mail, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("input", {
                id: "email",
                name: "email",
                type: "email",
                autoComplete: "email",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                placeholder: "lecturer@university.edu.ng"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "password",
                className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
                children: "Password"
              }), /* @__PURE__ */ jsx(Link, {
                to: "/forgot-password",
                className: "text-xs font-semibold text-stone-600 hover:text-black hover:underline",
                children: "Forgot password?"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-1.5 relative",
              children: [/* @__PURE__ */ jsx("div", {
                className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                children: /* @__PURE__ */ jsx(Lock, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("input", {
                id: "password",
                name: "password",
                type: showPassword ? "text" : "password",
                autoComplete: "current-password",
                required: true,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "block w-full pl-10 pr-11 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                placeholder: "Enter your password"
              }), /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer",
                "aria-label": showPassword ? "Hide password" : "Show password",
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, {
                  className: "w-4 h-4"
                }) : /* @__PURE__ */ jsx(Eye, {
                  className: "w-4 h-4"
                })
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsxs(Button, {
              type: "submit",
              variant: "primary",
              className: "w-full py-3",
              isLoading,
              children: [/* @__PURE__ */ jsx("span", {
                children: "Sign In to Portal"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-4 h-4 ml-1.5"
              })]
            })
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "mt-6 pt-6 border-t border-black/[0.06] text-center",
          children: /* @__PURE__ */ jsxs("p", {
            className: "text-xs text-stone-500 font-medium",
            children: ["New lecturer on ClassMark?", " ", /* @__PURE__ */ jsx(Link, {
              to: "/register",
              className: "font-bold text-[#111111] hover:underline",
              children: "Create an account"
            })]
          })
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-6 text-center",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "text-xs font-semibold text-stone-500 hover:text-black transition-colors",
          children: "← Return to Home"
        })
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login,
  loader: loader$e
}, Symbol.toStringTag, { value: "Module" }));
async function loader$d({
  request
}) {
  const user = await getUser(request);
  if (user) {
    throw redirect("/dashboard");
  }
  return null;
}
const register = UNSAFE_withComponentProps(function RegisterPage() {
  useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    institution: "",
    department: "",
    agreeTerms: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const enterPortal = () => {
    window.location.href = "/dashboard";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }
    if (!formData.agreeTerms) {
      setErrorMessage("Please accept the terms of service and privacy notice to continue.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed. Please check your information.");
        setIsLoading(false);
        return;
      }
      setRegisteredUser({
        fullName: formData.fullName,
        email: formData.email,
        institution: formData.institution
      });
      let count = 5;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          window.location.href = "/dashboard";
        }
      }, 1e3);
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#faf9f5] text-[#161616] font-sans flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#d7f837] selection:text-black",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3",
      children: [/* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "inline-flex items-center gap-2.5 focus:outline-none group",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform",
          children: /* @__PURE__ */ jsx(GraduationCap, {
            className: "w-5 h-5 text-[#d7f837]"
          })
        }), /* @__PURE__ */ jsx("span", {
          className: "font-extrabold text-[#111111] tracking-tight text-2xl",
          children: "CLASSMARK"
        }), /* @__PURE__ */ jsx("span", {
          className: "w-2 h-2 rounded-full bg-[#d7f837]"
        })]
      }), /* @__PURE__ */ jsx("h2", {
        className: "text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]",
        children: "Create Lecturer Account"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto",
        children: "Set up your academic workspace for university attendance management"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mt-8 sm:mx-auto sm:w-full sm:max-w-lg",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]",
        children: [registeredUser ? /* @__PURE__ */ jsxs("div", {
          className: "py-2 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-16 h-16 rounded-full bg-[#d7f837] text-black mx-auto flex items-center justify-center shadow-xs",
            children: /* @__PURE__ */ jsx(CheckCircle2, {
              className: "w-9 h-9 text-black"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsxs("span", {
              className: "inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full mb-2",
              children: [/* @__PURE__ */ jsx(CheckCircle2, {
                className: "w-3.5 h-3.5 text-[#d7f837]"
              }), "Registration Successful"]
            }), /* @__PURE__ */ jsxs("h3", {
              className: "text-xl font-extrabold text-[#111111]",
              children: ["Welcome to ClassMark, ", registeredUser.fullName, "!"]
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-2 text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed",
              children: "Your academic lecturer workspace has been initialized. You now have full access to class rosters, dynamic QR sessions, and semester reports."
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-4 bg-[#faf9f5] border border-black/[0.06] rounded-2xl text-left text-xs space-y-2",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex justify-between py-1 border-b border-black/[0.04]",
              children: [/* @__PURE__ */ jsx("span", {
                className: "text-stone-500 font-medium",
                children: "Lecturer Name:"
              }), /* @__PURE__ */ jsx("span", {
                className: "font-bold text-[#111111]",
                children: registeredUser.fullName
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex justify-between py-1 border-b border-black/[0.04]",
              children: [/* @__PURE__ */ jsx("span", {
                className: "text-stone-500 font-medium",
                children: "Institutional Email:"
              }), /* @__PURE__ */ jsx("span", {
                className: "font-bold text-[#111111]",
                children: registeredUser.email
              })]
            }), registeredUser.institution && /* @__PURE__ */ jsxs("div", {
              className: "flex justify-between py-1 border-b border-black/[0.04]",
              children: [/* @__PURE__ */ jsx("span", {
                className: "text-stone-500 font-medium",
                children: "Institution:"
              }), /* @__PURE__ */ jsx("span", {
                className: "font-bold text-[#111111]",
                children: registeredUser.institution
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex justify-between py-1",
              children: [/* @__PURE__ */ jsx("span", {
                className: "text-stone-500 font-medium",
                children: "Session Status:"
              }), /* @__PURE__ */ jsxs("span", {
                className: "font-bold text-emerald-700 flex items-center gap-1.5",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"
                }), "Verified & Logged In"]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "pt-2 space-y-3",
            children: [/* @__PURE__ */ jsxs("button", {
              type: "button",
              onClick: enterPortal,
              className: "w-full py-3.5 px-4 bg-[#111111] hover:bg-black text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]",
              children: [/* @__PURE__ */ jsx("span", {
                children: "Enter Lecturer Workspace"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-4 h-4 text-[#d7f837]"
              })]
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-[11px] text-stone-400 font-medium",
              children: ["Entering portal automatically in ", countdown, "s, or click the button above to enter immediately."]
            }), /* @__PURE__ */ jsxs("div", {
              className: "pt-2 border-t border-black/[0.06] flex items-center justify-center gap-4 text-xs text-stone-500",
              children: [/* @__PURE__ */ jsx(Link, {
                to: "/login",
                className: "text-black font-semibold hover:underline",
                children: "Sign In Screen"
              }), /* @__PURE__ */ jsx("span", {
                children: "•"
              }), /* @__PURE__ */ jsx(Link, {
                to: "/courses/new",
                className: "text-black font-semibold hover:underline",
                children: "Create Course Directly"
              })]
            })]
          })]
        }) : /* @__PURE__ */ jsxs("form", {
          className: "space-y-4",
          onSubmit: handleSubmit,
          children: [errorMessage && /* @__PURE__ */ jsxs("div", {
            className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5",
            children: [/* @__PURE__ */ jsx(AlertCircle, {
              className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5"
            }), /* @__PURE__ */ jsx("span", {
              className: "font-medium leading-relaxed",
              children: errorMessage
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
              children: "Full Name *"
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-1.5 relative",
              children: [/* @__PURE__ */ jsx("div", {
                className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                children: /* @__PURE__ */ jsx(User, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("input", {
                name: "fullName",
                type: "text",
                required: true,
                value: formData.fullName,
                onChange: handleChange,
                className: "block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                placeholder: "Dr. Samuel Adebayo"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
              children: "Institutional Email *"
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-1.5 relative",
              children: [/* @__PURE__ */ jsx("div", {
                className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                children: /* @__PURE__ */ jsx(Mail, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("input", {
                name: "email",
                type: "email",
                required: true,
                value: formData.email,
                onChange: handleChange,
                className: "block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                placeholder: "s.adebayo@university.edu.ng"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
                children: "Institution (Optional)"
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-1.5 relative",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                  children: /* @__PURE__ */ jsx(Building, {
                    className: "w-4 h-4"
                  })
                }), /* @__PURE__ */ jsx("input", {
                  name: "institution",
                  type: "text",
                  value: formData.institution,
                  onChange: handleChange,
                  className: "block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                  placeholder: "University of Ibadan"
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
                children: "Department (Optional)"
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-1.5 relative",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                  children: /* @__PURE__ */ jsx(BookOpen, {
                    className: "w-4 h-4"
                  })
                }), /* @__PURE__ */ jsx("input", {
                  name: "department",
                  type: "text",
                  value: formData.department,
                  onChange: handleChange,
                  className: "block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                  placeholder: "Computer Science"
                })]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
                children: "Password *"
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-1.5 relative",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                  children: /* @__PURE__ */ jsx(Lock, {
                    className: "w-4 h-4"
                  })
                }), /* @__PURE__ */ jsx("input", {
                  name: "password",
                  type: showPassword ? "text" : "password",
                  required: true,
                  minLength: 8,
                  value: formData.password,
                  onChange: handleChange,
                  className: "block w-full pl-10 pr-10 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                  placeholder: "Min. 8 characters"
                }), /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setShowPassword(!showPassword),
                  className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer",
                  "aria-label": showPassword ? "Hide password" : "Show password",
                  children: showPassword ? /* @__PURE__ */ jsx(EyeOff, {
                    className: "w-4 h-4"
                  }) : /* @__PURE__ */ jsx(Eye, {
                    className: "w-4 h-4"
                  })
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
                children: "Confirm Password *"
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-1.5 relative",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                  children: /* @__PURE__ */ jsx(Lock, {
                    className: "w-4 h-4"
                  })
                }), /* @__PURE__ */ jsx("input", {
                  name: "confirmPassword",
                  type: showConfirmPassword ? "text" : "password",
                  required: true,
                  minLength: 8,
                  value: formData.confirmPassword,
                  onChange: handleChange,
                  className: "block w-full pl-10 pr-10 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                  placeholder: "Re-enter password"
                }), /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setShowConfirmPassword(!showConfirmPassword),
                  className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer",
                  "aria-label": showConfirmPassword ? "Hide password" : "Show password",
                  children: showConfirmPassword ? /* @__PURE__ */ jsx(EyeOff, {
                    className: "w-4 h-4"
                  }) : /* @__PURE__ */ jsx(Eye, {
                    className: "w-4 h-4"
                  })
                })]
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsxs("label", {
              className: "flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer",
              children: [/* @__PURE__ */ jsx("input", {
                type: "checkbox",
                name: "agreeTerms",
                checked: formData.agreeTerms,
                onChange: handleChange,
                className: "mt-0.5 rounded border-black/20 text-black focus:ring-black accent-black"
              }), /* @__PURE__ */ jsx("span", {
                children: "I confirm that I am an authorized academic lecturer and agree to the institutional terms of service and academic integrity standards."
              })]
            })
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-3",
            children: /* @__PURE__ */ jsxs(Button, {
              type: "submit",
              variant: "primary",
              className: "w-full py-3",
              isLoading,
              children: [/* @__PURE__ */ jsx("span", {
                children: "Register Academic Account"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-4 h-4 ml-1.5"
              })]
            })
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "mt-6 pt-6 border-t border-black/[0.06] text-center",
          children: /* @__PURE__ */ jsxs("p", {
            className: "text-xs text-stone-500 font-medium",
            children: ["Already have an account?", " ", /* @__PURE__ */ jsx(Link, {
              to: "/login",
              className: "font-bold text-[#111111] hover:underline",
              children: "Sign in to workspace"
            })]
          })
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-6 text-center",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "text-xs font-semibold text-stone-500 hover:text-black transition-colors",
          children: "← Return to Home"
        })
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: register,
  loader: loader$d
}, Symbol.toStringTag, { value: "Module" }));
const forgotPassword = UNSAFE_withComponentProps(function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit request.");
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#faf9f5] text-[#161616] font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#d7f837] selection:text-black",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3",
      children: [/* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "inline-flex items-center gap-2.5 focus:outline-none group",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform",
          children: /* @__PURE__ */ jsx(GraduationCap, {
            className: "w-5 h-5 text-[#d7f837]"
          })
        }), /* @__PURE__ */ jsx("span", {
          className: "font-extrabold text-[#111111] tracking-tight text-2xl",
          children: "CLASSMARK"
        }), /* @__PURE__ */ jsx("span", {
          className: "w-2 h-2 rounded-full bg-[#d7f837]"
        })]
      }), /* @__PURE__ */ jsx("h2", {
        className: "text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]",
        children: "Reset Your Password"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto",
        children: "Enter your registered institutional email address to receive password reset instructions"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md",
      children: /* @__PURE__ */ jsx("div", {
        className: "bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]",
        children: message ? /* @__PURE__ */ jsxs("div", {
          className: "space-y-4",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-start gap-3",
            children: [/* @__PURE__ */ jsx(CheckCircle2, {
              className: "w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
            }), /* @__PURE__ */ jsxs("div", {
              className: "text-xs leading-relaxed",
              children: [/* @__PURE__ */ jsx("p", {
                className: "font-bold text-emerald-900",
                children: "Request Received"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-emerald-700",
                children: message
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "text-center pt-2",
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/login",
              className: "inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-black hover:underline",
              children: [/* @__PURE__ */ jsx(ArrowLeft, {
                className: "w-3.5 h-3.5"
              }), /* @__PURE__ */ jsx("span", {
                children: "Return to sign in"
              })]
            })
          })]
        }) : /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-4",
          children: [error && /* @__PURE__ */ jsxs("div", {
            className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5",
            children: [/* @__PURE__ */ jsx(AlertCircle, {
              className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5"
            }), /* @__PURE__ */ jsx("span", {
              className: "font-medium leading-relaxed",
              children: error
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "email",
              className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
              children: "Registered Institutional Email"
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-1.5 relative",
              children: [/* @__PURE__ */ jsx("div", {
                className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                children: /* @__PURE__ */ jsx(Mail, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("input", {
                id: "email",
                type: "email",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                placeholder: "lecturer@university.edu.ng"
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsxs(Button, {
              type: "submit",
              variant: "primary",
              className: "w-full py-3",
              isLoading,
              children: [/* @__PURE__ */ jsx("span", {
                children: "Send Reset Email"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-4 h-4 ml-1.5"
              })]
            })
          }), /* @__PURE__ */ jsx("div", {
            className: "text-center pt-2",
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/login",
              className: "inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-black hover:underline",
              children: [/* @__PURE__ */ jsx(ArrowLeft, {
                className: "w-3.5 h-3.5"
              }), /* @__PURE__ */ jsx("span", {
                children: "Return to sign in"
              })]
            })
          })]
        })
      })
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: forgotPassword
}, Symbol.toStringTag, { value: "Module" }));
const resetPassword = UNSAFE_withComponentProps(function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!token) {
      setErrorMessage("Missing or invalid password reset token.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reset password.");
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#faf9f5] text-[#161616] font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#d7f837] selection:text-black",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3",
      children: [/* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "inline-flex items-center gap-2.5 focus:outline-none group",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform",
          children: /* @__PURE__ */ jsx(GraduationCap, {
            className: "w-5 h-5 text-[#d7f837]"
          })
        }), /* @__PURE__ */ jsx("span", {
          className: "font-extrabold text-[#111111] tracking-tight text-2xl",
          children: "CLASSMARK"
        }), /* @__PURE__ */ jsx("span", {
          className: "w-2 h-2 rounded-full bg-[#d7f837]"
        })]
      }), /* @__PURE__ */ jsx("h2", {
        className: "text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]",
        children: "Create New Password"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto",
        children: "Choose a secure password for your lecturer account"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md",
      children: /* @__PURE__ */ jsx("div", {
        className: "bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]",
        children: success ? /* @__PURE__ */ jsxs("div", {
          className: "text-center space-y-4 py-2",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-14 h-14 rounded-full bg-[#d7f837] text-black mx-auto flex items-center justify-center shadow-xs",
            children: /* @__PURE__ */ jsx(CheckCircle2, {
              className: "w-8 h-8 text-black"
            })
          }), /* @__PURE__ */ jsx("h3", {
            className: "text-base font-bold text-[#111111]",
            children: "Password Reset Complete"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs text-stone-600 leading-relaxed",
            children: "Your password has been successfully updated. You may now sign in with your new credentials."
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsxs(Button, {
              variant: "primary",
              className: "w-full py-3",
              onClick: () => navigate("/login"),
              children: [/* @__PURE__ */ jsx("span", {
                children: "Sign In Now"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-4 h-4 ml-1.5"
              })]
            })
          })]
        }) : /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-4",
          children: [errorMessage && /* @__PURE__ */ jsxs("div", {
            className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5",
            children: [/* @__PURE__ */ jsx(AlertCircle, {
              className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5"
            }), /* @__PURE__ */ jsx("span", {
              className: "font-medium leading-relaxed",
              children: errorMessage
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
              children: "New Password"
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-1.5 relative",
              children: [/* @__PURE__ */ jsx("div", {
                className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                children: /* @__PURE__ */ jsx(Lock, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("input", {
                type: showPassword ? "text" : "password",
                required: true,
                minLength: 8,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "block w-full pl-10 pr-10 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                placeholder: "Min. 8 characters"
              }), /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer",
                "aria-label": showPassword ? "Hide password" : "Show password",
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, {
                  className: "w-4 h-4"
                }) : /* @__PURE__ */ jsx(Eye, {
                  className: "w-4 h-4"
                })
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-xs font-bold text-stone-700 uppercase tracking-wider",
              children: "Confirm New Password"
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-1.5 relative",
              children: [/* @__PURE__ */ jsx("div", {
                className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400",
                children: /* @__PURE__ */ jsx(Lock, {
                  className: "w-4 h-4"
                })
              }), /* @__PURE__ */ jsx("input", {
                type: showPassword ? "text" : "password",
                required: true,
                minLength: 8,
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                className: "block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium",
                placeholder: "Re-enter new password"
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsxs(Button, {
              type: "submit",
              variant: "primary",
              className: "w-full py-3",
              isLoading,
              children: [/* @__PURE__ */ jsx("span", {
                children: "Update Password"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-4 h-4 ml-1.5"
              })]
            })
          }), /* @__PURE__ */ jsx("div", {
            className: "text-center pt-2",
            children: /* @__PURE__ */ jsx(Link, {
              to: "/login",
              className: "inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-black hover:underline",
              children: /* @__PURE__ */ jsx("span", {
                children: "Return to Sign In"
              })
            })
          })]
        })
      })
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: resetPassword
}, Symbol.toStringTag, { value: "Module" }));
const verifyEmail = UNSAFE_withComponentProps(function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "Verifying your email token..." : "Missing verification token. Please check your verification link.");
  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token
      })
    }).then((res) => res.json()).then((data) => {
      if (!isMounted) return;
      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed. The token may be expired or invalid.");
      }
    }).catch(() => {
      if (!isMounted) return;
      setStatus("error");
      setMessage("A network error occurred. Please try again.");
    });
    return () => {
      isMounted = false;
    };
  }, [token]);
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#faf9f5] text-[#161616] font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#d7f837] selection:text-black",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3",
      children: [/* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "inline-flex items-center gap-2.5 focus:outline-none group",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform",
          children: /* @__PURE__ */ jsx(GraduationCap, {
            className: "w-5 h-5 text-[#d7f837]"
          })
        }), /* @__PURE__ */ jsx("span", {
          className: "font-extrabold text-[#111111] tracking-tight text-2xl",
          children: "CLASSMARK"
        }), /* @__PURE__ */ jsx("span", {
          className: "w-2 h-2 rounded-full bg-[#d7f837]"
        })]
      }), /* @__PURE__ */ jsx("h2", {
        className: "text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]",
        children: "Email Verification"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto",
        children: "Verifying your institutional lecturer identity"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md",
      children: /* @__PURE__ */ jsxs("div", {
        className: "bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px] text-center space-y-4",
        children: [status === "loading" && /* @__PURE__ */ jsxs("div", {
          className: "space-y-4 py-4",
          children: [/* @__PURE__ */ jsx(Loader2, {
            className: "w-10 h-10 text-black animate-spin mx-auto"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs text-stone-600 font-medium",
            children: message
          })]
        }), status === "success" && /* @__PURE__ */ jsxs("div", {
          className: "space-y-4 py-2",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-14 h-14 rounded-full bg-[#d7f837] text-black mx-auto flex items-center justify-center shadow-xs",
            children: /* @__PURE__ */ jsx(CheckCircle2, {
              className: "w-8 h-8 text-black"
            })
          }), /* @__PURE__ */ jsx("h3", {
            className: "text-base font-bold text-[#111111]",
            children: "Verified Successfully!"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs text-stone-600 leading-relaxed",
            children: message
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsxs(Button, {
              variant: "primary",
              className: "w-full py-3",
              onClick: () => window.location.href = "/dashboard",
              children: [/* @__PURE__ */ jsx("span", {
                children: "Go to Workspace"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-4 h-4 ml-1.5"
              })]
            })
          })]
        }), status === "error" && /* @__PURE__ */ jsxs("div", {
          className: "space-y-4 py-2",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-14 h-14 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center",
            children: /* @__PURE__ */ jsx(AlertCircle, {
              className: "w-8 h-8 text-rose-600"
            })
          }), /* @__PURE__ */ jsx("h3", {
            className: "text-base font-bold text-[#111111]",
            children: "Verification Failed"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs text-stone-600 leading-relaxed",
            children: message
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/login",
              className: "inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full transition-all shadow-xs",
              children: [/* @__PURE__ */ jsx("span", {
                children: "Return to Sign In"
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-3.5 h-3.5"
              })]
            })
          })]
        })]
      })
    })]
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: verifyEmail
}, Symbol.toStringTag, { value: "Module" }));
function Sidebar({ user }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard"
    },
    {
      label: "My Courses",
      href: "/courses",
      icon: BookOpen,
      active: pathname.startsWith("/courses") && !pathname.includes("/reports")
    },
    {
      label: "Attendance Reports",
      href: "/courses",
      icon: FileSpreadsheet,
      active: pathname.includes("/reports")
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings"
    }
  ];
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    } finally {
      navigate("/login");
    }
  };
  return /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-64 border-r border-black/[0.06] bg-white flex-col h-screen sticky top-0 shrink-0 select-none", children: [
    /* @__PURE__ */ jsx("div", { className: "p-5 border-b border-black/[0.06]", children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "flex items-center gap-3 group", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform", children: /* @__PURE__ */ jsx(GraduationCap, { className: "w-5 h-5 text-[#d7f837]" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("h1", { className: "font-extrabold text-[#111111] tracking-tight text-lg leading-tight", children: "CLASSMARK" }),
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#d7f837]" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5", children: "Academic Attendance" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "px-4 py-3.5", children: /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/courses/new",
        className: "flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]",
        children: [
          /* @__PURE__ */ jsx(PlusCircle, { className: "w-4 h-4 text-[#d7f837]" }),
          /* @__PURE__ */ jsx("span", { children: "Create Course" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("nav", { className: "flex-1 px-3 py-2 space-y-1 overflow-y-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "px-3.5 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider", children: "Workspace" }),
      navItems.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.href,
            className: cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all",
              item.active ? "bg-[#111111] text-white shadow-xs" : "text-stone-600 hover:bg-[#edebe4]/60 hover:text-black"
            ),
            children: [
              /* @__PURE__ */ jsx(
                Icon,
                {
                  className: cn(
                    "w-4 h-4 transition-colors",
                    item.active ? "text-[#d7f837]" : "text-stone-400"
                  )
                }
              ),
              /* @__PURE__ */ jsx("span", { children: item.label })
            ]
          },
          item.label
        );
      })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-black/[0.06] bg-[#faf9f5]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0 flex-1 pr-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-extrabold text-xs shadow-2xs border border-black/5 shrink-0", children: user?.fullName ? user.fullName[0].toUpperCase() : "L" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-stone-900 truncate", children: user?.fullName || "Lecturer" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-stone-500 font-medium truncate", children: user?.institution || user?.email || "Academic Staff" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleLogout,
          title: "Sign out",
          className: "p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer",
          children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
        }
      )
    ] }) })
  ] });
}
function Navbar({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleMediaChange = (e) => {
      if (e.matches) {
        setMobileOpen(false);
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    } finally {
      navigate("/login");
    }
  };
  const navLinks = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard"
    },
    {
      label: "My Courses",
      href: "/courses",
      icon: BookOpen,
      active: pathname.startsWith("/courses") && !pathname.includes("/reports")
    },
    {
      label: "Attendance Reports",
      href: "/courses",
      icon: FileSpreadsheet,
      active: pathname.includes("/reports")
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings"
    }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 sm:gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setMobileOpen(!mobileOpen),
            className: "lg:hidden p-2 text-stone-700 hover:text-black rounded-full hover:bg-black/5 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black cursor-pointer",
            "aria-label": "Toggle navigation menu",
            "aria-expanded": mobileOpen,
            children: mobileOpen ? /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "flex lg:hidden items-center gap-2 focus:outline-none", children: [
          /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs", children: /* @__PURE__ */ jsx(GraduationCap, { className: "w-4 h-4 text-[#d7f837]" }) }),
          /* @__PURE__ */ jsx("span", { className: "font-extrabold text-[#111111] text-sm tracking-tight", children: "CLASSMARK" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex items-center gap-2 text-xs text-stone-500 font-semibold", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" }),
          /* @__PURE__ */ jsx("span", { children: "Academic Portal Active" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-4", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/courses/new",
            className: "hidden md:inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02]",
            children: [
              /* @__PURE__ */ jsx(PlusCircle, { className: "w-3.5 h-3.5 text-[#d7f837]" }),
              /* @__PURE__ */ jsx("span", { children: "Create Course" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#edebe4] text-stone-700 rounded-full text-xs font-bold", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 text-stone-500" }),
          /* @__PURE__ */ jsx("span", { children: user?.timeZone || "Africa/Lagos" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-black/[0.06]", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-extrabold text-xs shadow-2xs border border-black/5", children: user?.fullName ? user.fullName[0].toUpperCase() : "L" }),
          /* @__PURE__ */ jsxs("div", { className: "hidden sm:block text-left", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-stone-900 leading-tight truncate max-w-[140px]", children: user?.fullName || "Lecturer" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-stone-500 font-medium leading-tight truncate max-w-[140px]", children: user?.institution || "Verified Staff" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleLogout,
              title: "Sign out",
              className: "text-stone-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors cursor-pointer",
              "aria-label": "Sign out",
              children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
            }
          )
        ] })
      ] })
    ] }),
    mobileOpen && /* @__PURE__ */ jsxs("div", { className: "lg:hidden fixed inset-0 z-50 flex", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in",
          onClick: () => setMobileOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative w-76 max-w-[85vw] bg-[#faf9f5] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-black/[0.06] flex items-center justify-between bg-white", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs", children: /* @__PURE__ */ jsx(GraduationCap, { className: "w-4 h-4 text-[#d7f837]" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-extrabold text-stone-900 text-sm leading-tight tracking-tight", children: "CLASSMARK" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-bold text-stone-500 tracking-wider", children: "Academic Portal" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setMobileOpen(false),
              className: "w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:text-black cursor-pointer",
              "aria-label": "Close menu",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-black/[0.06] bg-[#edebe4]/60", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-sm shadow-xs shrink-0", children: user?.fullName ? user.fullName[0].toUpperCase() : "L" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-stone-900 truncate", children: user?.fullName || "Lecturer" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 truncate", children: user?.email }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-stone-700 truncate", children: user?.institution || "Academic Staff" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "p-3 border-b border-black/[0.06]", children: /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/courses/new",
            onClick: () => setMobileOpen(false),
            className: "flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs transition-colors",
            children: [
              /* @__PURE__ */ jsx(PlusCircle, { className: "w-4 h-4 text-[#d7f837]" }),
              /* @__PURE__ */ jsx("span", { children: "Create Academic Course" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs("nav", { className: "flex-1 p-3 space-y-1.5 overflow-y-auto", children: [
          /* @__PURE__ */ jsx("p", { className: "px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider", children: "Workspace" }),
          navLinks.map((item) => {
            const Icon = item.icon;
            return /* @__PURE__ */ jsxs(
              Link,
              {
                to: item.href,
                onClick: () => setMobileOpen(false),
                className: cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all",
                  item.active ? "bg-[#111111] text-white shadow-xs" : "text-stone-700 hover:bg-stone-200/60"
                ),
                children: [
                  /* @__PURE__ */ jsx(Icon, { className: cn("w-4 h-4", item.active ? "text-[#d7f837]" : "text-stone-400") }),
                  /* @__PURE__ */ jsx("span", { children: item.label })
                ]
              },
              item.label
            );
          })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-black/[0.06] bg-white space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-stone-500 font-semibold", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 text-stone-400" }),
              /* @__PURE__ */ jsx("span", { children: user?.timeZone || "Africa/Lagos" })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-emerald-700", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 inline-block" }),
              "Online"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: handleLogout,
              className: "flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "Sign Out of Portal" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function DashboardLayout({ user, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-[#faf9f5] text-[#161616] font-sans antialiased selection:bg-[#d7f837] selection:text-black", children: [
    /* @__PURE__ */ jsx(Sidebar, { user }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsx(Navbar, { user }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto", children })
    ] })
  ] });
}
function Badge({ className, variant = "default", children, ...props }) {
  const variantStyles = {
    default: "bg-[#d7f837] text-black border-black/10 font-bold",
    accent: "bg-[#d7f837] text-black border-black/10 font-bold",
    dark: "bg-[#111111] text-white border-transparent font-semibold",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold",
    warning: "bg-amber-50 text-amber-900 border-amber-200 font-semibold",
    destructive: "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
    outline: "bg-white/80 text-stone-700 border-black/10 font-medium",
    slate: "bg-[#edebe4] text-stone-800 border-black/5 font-medium"
  };
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border shadow-2xs",
        variantStyles[variant],
        className
      ),
      ...props,
      children
    }
  );
}
async function loader$c({
  request
}) {
  const user = await requireUser(request);
  const courses2 = await prisma.course.findMany({
    where: {
      lecturerId: user.id
    },
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      enrolments: {
        where: {
          status: "ACTIVE"
        },
        select: {
          studentId: true
        }
      },
      attendanceSessions: {
        orderBy: {
          sessionDate: "desc"
        },
        take: 1,
        include: {
          records: {
            where: {
              status: {
                in: ["PRESENT", "LATE"]
              }
            },
            select: {
              id: true
            }
          }
        }
      },
      _count: {
        select: {
          enrolments: {
            where: {
              status: "ACTIVE"
            }
          },
          attendanceSessions: true
        }
      }
    }
  });
  const uniqueStudentIds = /* @__PURE__ */ new Set();
  courses2.forEach((c) => {
    c.enrolments.forEach((e) => uniqueStudentIds.add(e.studentId));
  });
  const totalUniqueStudents = uniqueStudentIds.size;
  const totalSessions = courses2.reduce((sum, c) => sum + c._count.attendanceSessions, 0);
  const recentSessions = await prisma.attendanceSession.findMany({
    where: {
      course: {
        lecturerId: user.id
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5,
    include: {
      course: {
        select: {
          code: true,
          title: true
        }
      },
      _count: {
        select: {
          records: {
            where: {
              status: {
                in: ["PRESENT", "LATE"]
              }
            }
          }
        }
      }
    }
  });
  const activeOpenSessions = await prisma.attendanceSession.findMany({
    where: {
      course: {
        lecturerId: user.id
      },
      status: "OPEN"
    },
    include: {
      course: {
        select: {
          code: true,
          title: true
        }
      }
    }
  });
  return {
    user,
    courses: courses2,
    totalUniqueStudents,
    totalSessions,
    recentSessions,
    activeOpenSessions
  };
}
const dashboard = UNSAFE_withComponentProps(function DashboardPage() {
  const {
    user,
    courses: courses2,
    totalUniqueStudents,
    totalSessions,
    recentSessions,
    activeOpenSessions
  } = useLoaderData();
  return /* @__PURE__ */ jsx(DashboardLayout, {
    user,
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-6 sm:space-y-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]",
            children: "Lecturer Overview"
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-xs sm:text-sm text-stone-500 font-medium mt-0.5",
            children: ["Welcome back, ", user.fullName, ". Academic attendance workspace."]
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex items-center gap-2",
          children: /* @__PURE__ */ jsxs(Link, {
            to: "/courses/new",
            className: "inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]",
            children: [/* @__PURE__ */ jsx(PlusCircle, {
              className: "w-4 h-4 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "Create Course"
            })]
          })
        })]
      }), activeOpenSessions.length > 0 && /* @__PURE__ */ jsxs("div", {
        className: "p-4 sm:p-5 bg-[#edebe4] border border-black/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-start gap-3",
          children: [/* @__PURE__ */ jsx("span", {
            className: "w-2.5 h-2.5 rounded-full bg-[#d7f837] animate-ping mt-1 shrink-0"
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-xs font-extrabold text-[#111111] uppercase tracking-wider",
              children: "Live Attendance Active"
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-xs text-stone-600 mt-0.5 font-medium",
              children: ["You currently have ", activeOpenSessions.length, " active session accepting student check-ins:", " ", /* @__PURE__ */ jsx("strong", {
                className: "text-black",
                children: activeOpenSessions.map((s) => s.course.code).join(", ")
              }), "."]
            })]
          })]
        }), /* @__PURE__ */ jsxs(Link, {
          to: `/courses/${activeOpenSessions[0].courseId}/attendance/${activeOpenSessions[0].id}`,
          className: "inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-black text-white rounded-full text-xs font-bold shrink-0 transition-all shadow-xs",
          children: [/* @__PURE__ */ jsx(QrCode, {
            className: "w-3.5 h-3.5 text-[#d7f837]"
          }), /* @__PURE__ */ jsx("span", {
            children: "View Live Session"
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "p-6 bg-white border border-black/[0.06] rounded-[24px] shadow-xs flex items-center gap-4",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-12 h-12 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0 shadow-xs",
            children: /* @__PURE__ */ jsx(BookOpen, {
              className: "w-5 h-5"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight",
              children: courses2.length
            }), /* @__PURE__ */ jsx("div", {
              className: "text-[11px] font-bold text-stone-500 uppercase tracking-wider",
              children: "Active Courses Assigned"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "p-6 bg-white border border-black/[0.06] rounded-[24px] shadow-xs flex items-center gap-4",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-12 h-12 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0 shadow-xs",
            children: /* @__PURE__ */ jsx(Users, {
              className: "w-5 h-5"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight",
              children: totalUniqueStudents
            }), /* @__PURE__ */ jsx("div", {
              className: "text-[11px] font-bold text-stone-500 uppercase tracking-wider",
              children: "Unique Enrolled Students"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "p-6 bg-white border border-black/[0.06] rounded-[24px] shadow-xs flex items-center gap-4",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-12 h-12 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0 shadow-xs",
            children: /* @__PURE__ */ jsx(CheckCircle, {
              className: "w-5 h-5"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight",
              children: totalSessions
            }), /* @__PURE__ */ jsx("div", {
              className: "text-[11px] font-bold text-stone-500 uppercase tracking-wider",
              children: "Attendance Sessions Logged"
            })]
          })]
        })]
      }), courses2.length === 0 ? /* @__PURE__ */ jsxs("div", {
        className: "p-8 sm:p-14 bg-white border border-black/[0.06] rounded-[28px] text-center max-w-xl mx-auto shadow-xs space-y-4",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-14 h-14 rounded-full bg-[#edebe4] text-stone-800 flex items-center justify-center mx-auto mb-2 border border-black/5 shadow-2xs",
          children: /* @__PURE__ */ jsx(FolderOpen, {
            className: "w-7 h-7 text-black"
          })
        }), /* @__PURE__ */ jsx("h3", {
          className: "text-lg font-extrabold text-[#111111]",
          children: "No Courses Yet"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs sm:text-sm text-stone-500 leading-relaxed font-medium",
          children: "You have not created any courses in your ClassMark workspace. Once you create a course, you can import student rosters, launch dynamic QR sessions, and generate semester attendance reports."
        }), /* @__PURE__ */ jsx("div", {
          className: "pt-2",
          children: /* @__PURE__ */ jsxs(Link, {
            to: "/courses/new",
            className: "inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02]",
            children: [/* @__PURE__ */ jsx(PlusCircle, {
              className: "w-4 h-4 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "Create Your First Course"
            })]
          })
        })]
      }) : /* @__PURE__ */ jsxs("div", {
        className: "space-y-6 sm:space-y-8",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "bg-white border border-black/[0.06] rounded-[24px] overflow-hidden shadow-xs",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "px-6 py-5 border-b border-black/[0.06] flex items-center justify-between",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h3", {
                className: "text-sm font-extrabold text-[#111111]",
                children: "Your Active Courses"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-xs text-stone-500 mt-0.5 font-medium",
                children: "Select any course to manage rosters, start attendance, or export records"
              })]
            }), /* @__PURE__ */ jsxs(Link, {
              to: "/courses",
              className: "text-xs font-bold text-black hover:underline inline-flex items-center gap-1",
              children: [/* @__PURE__ */ jsxs("span", {
                children: ["View all (", courses2.length, ")"]
              }), /* @__PURE__ */ jsx(ArrowRight, {
                className: "w-3.5 h-3.5"
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "overflow-x-auto",
            children: /* @__PURE__ */ jsxs("table", {
              className: "w-full text-left text-xs",
              children: [/* @__PURE__ */ jsx("thead", {
                className: "bg-[#edebe4]/50 text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-black/[0.06]",
                children: /* @__PURE__ */ jsxs("tr", {
                  children: [/* @__PURE__ */ jsx("th", {
                    className: "px-6 py-3.5",
                    children: "Course Code"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "px-6 py-3.5",
                    children: "Course Title"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "px-6 py-3.5",
                    children: "Session & Semester"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "px-6 py-3.5 text-center",
                    children: "Enrolled"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "px-6 py-3.5 text-center",
                    children: "Sessions"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "px-6 py-3.5",
                    children: "Latest Class"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "px-6 py-3.5 text-right",
                    children: "Quick Actions"
                  })]
                })
              }), /* @__PURE__ */ jsx("tbody", {
                className: "divide-y divide-black/[0.04]",
                children: courses2.map((course) => {
                  const latestSession = course.attendanceSessions[0];
                  return /* @__PURE__ */ jsxs("tr", {
                    className: "hover:bg-stone-50/80 transition-colors",
                    children: [/* @__PURE__ */ jsx("td", {
                      className: "px-6 py-4 font-extrabold text-[#111111]",
                      children: /* @__PURE__ */ jsx(Link, {
                        to: `/courses/${course.id}`,
                        className: "text-black hover:underline flex items-center gap-1.5",
                        children: /* @__PURE__ */ jsx("span", {
                          children: course.code
                        })
                      })
                    }), /* @__PURE__ */ jsx("td", {
                      className: "px-6 py-4 text-stone-700 max-w-xs truncate font-semibold",
                      children: course.title
                    }), /* @__PURE__ */ jsxs("td", {
                      className: "px-6 py-4 text-stone-500 font-medium",
                      children: [/* @__PURE__ */ jsx("span", {
                        children: course.session
                      }), " • ", /* @__PURE__ */ jsx("span", {
                        children: course.semester
                      })]
                    }), /* @__PURE__ */ jsx("td", {
                      className: "px-6 py-4 text-center font-bold text-stone-800",
                      children: course._count.enrolments
                    }), /* @__PURE__ */ jsx("td", {
                      className: "px-6 py-4 text-center font-bold text-stone-800",
                      children: course._count.attendanceSessions
                    }), /* @__PURE__ */ jsx("td", {
                      className: "px-6 py-4 text-stone-500 font-medium",
                      children: latestSession ? /* @__PURE__ */ jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [/* @__PURE__ */ jsx(Clock, {
                          className: "w-3.5 h-3.5 text-stone-400"
                        }), /* @__PURE__ */ jsx("span", {
                          children: formatDate(latestSession.sessionDate)
                        }), /* @__PURE__ */ jsxs("span", {
                          className: "text-[11px] text-stone-400 font-mono",
                          children: ["(", latestSession.records.length, " present)"]
                        })]
                      }) : /* @__PURE__ */ jsx("span", {
                        className: "text-stone-400 italic",
                        children: "No classes yet"
                      })
                    }), /* @__PURE__ */ jsxs("td", {
                      className: "px-6 py-4 text-right space-x-2",
                      children: [/* @__PURE__ */ jsxs(Link, {
                        to: `/courses/${course.id}/attendance/new`,
                        className: "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-[#d7f837] hover:bg-[#cbf028] rounded-full transition-all shadow-2xs",
                        children: [/* @__PURE__ */ jsx(QrCode, {
                          className: "w-3.5 h-3.5"
                        }), /* @__PURE__ */ jsx("span", {
                          children: "Take Attendance"
                        })]
                      }), /* @__PURE__ */ jsx(Link, {
                        to: `/courses/${course.id}`,
                        className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full transition-all shadow-2xs",
                        children: /* @__PURE__ */ jsx("span", {
                          children: "Manage"
                        })
                      })]
                    })]
                  }, course.id);
                })
              })]
            })
          })]
        }), recentSessions.length > 0 && /* @__PURE__ */ jsxs("div", {
          className: "bg-white border border-black/[0.06] rounded-[24px] p-6 shadow-xs",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-sm font-extrabold text-[#111111] mb-4",
            children: "Recent Attendance Activity"
          }), /* @__PURE__ */ jsx("div", {
            className: "divide-y divide-black/[0.04] text-xs",
            children: recentSessions.map((session) => /* @__PURE__ */ jsxs("div", {
              className: "py-3 flex items-center justify-between hover:bg-[#faf9f5] px-3 rounded-xl transition-colors",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-3",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "w-8 h-8 rounded-full bg-[#edebe4] text-black flex items-center justify-center font-bold text-xs",
                  children: /* @__PURE__ */ jsx(QrCode, {
                    className: "w-4 h-4"
                  })
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsxs("p", {
                    className: "font-bold text-stone-900",
                    children: [session.course.code, ": ", session.topic || "Lecture Attendance Session"]
                  }), /* @__PURE__ */ jsxs("p", {
                    className: "text-[11px] text-stone-500 font-medium",
                    children: [formatDate(session.sessionDate), " • ", session._count.records, " students marked present"]
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2.5",
                children: [/* @__PURE__ */ jsx(Badge, {
                  variant: session.status === "OPEN" ? "accent" : "slate",
                  children: session.status
                }), /* @__PURE__ */ jsx(Link, {
                  to: `/courses/${session.courseId}/attendance/${session.id}`,
                  className: "text-xs font-bold text-black hover:underline",
                  children: "View Session"
                })]
              })]
            }, session.id))
          })]
        })]
      })]
    })
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: dashboard,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg"
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  }[maxWidth];
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150", children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: `w-full ${maxWidthClass} bg-white rounded-[28px] border border-[#e7e5df] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "modal-title",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-[#e7e5df] bg-[#faf9f5]", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { id: "modal-title", className: "text-base font-bold text-[#111111] tracking-tight", children: title }),
            description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#666660] mt-0.5", children: description })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "w-8 h-8 rounded-full bg-[#edebe4] text-[#444440] hover:bg-[#111111] hover:text-[#d7f837] flex items-center justify-center transition-all",
              "aria-label": "Close dialog",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-6 max-h-[80vh] overflow-y-auto", children })
      ]
    }
  ) });
}
function EditCourseModal({
  isOpen,
  onClose,
  course,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    department: "",
    faculty: "",
    session: "",
    semester: "First Semester",
    classGroup: "",
    description: "",
    expectedSessions: "14",
    attendanceThreshold: "60",
    status: "ACTIVE"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code || "",
        title: course.title || "",
        department: course.department || "",
        faculty: course.faculty || "",
        session: course.session || "2026/2027",
        semester: course.semester || "First Semester",
        classGroup: course.classGroup || "",
        description: course.description || "",
        expectedSessions: course.expectedSessions ? course.expectedSessions.toString() : "",
        attendanceThreshold: course.attendanceThreshold ? course.attendanceThreshold.toString() : "60",
        status: course.status || "ACTIVE"
      });
      setErrorMessage(null);
    }
  }, [course, isOpen]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        department: formData.department.trim() || null,
        faculty: formData.faculty.trim() || null,
        session: formData.session.trim(),
        semester: formData.semester.trim(),
        classGroup: formData.classGroup.trim() || null,
        description: formData.description.trim() || null,
        expectedSessions: formData.expectedSessions ? parseInt(formData.expectedSessions, 10) : null,
        attendanceThreshold: parseFloat(formData.attendanceThreshold) || 60,
        status: formData.status
      };
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update course.");
        return;
      }
      if (onSuccess) {
        onSuccess(data.course);
      }
      onClose();
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  if (!course) return null;
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onClose,
      title: `Edit Course: ${course.code}`,
      description: "Update course details, academic terms, and attendance benchmarks",
      maxWidth: "2xl",
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        errorMessage && /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium leading-relaxed", children: errorMessage })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Course Code *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "code",
                required: true,
                value: formData.code,
                onChange: handleChange,
                placeholder: "CSC 201",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-bold"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Course Title *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "title",
                required: true,
                value: formData.title,
                onChange: handleChange,
                placeholder: "Data Structures and Algorithms",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Academic Session *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "session",
                required: true,
                value: formData.session,
                onChange: handleChange,
                placeholder: "2026/2027",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Semester *" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                name: "semester",
                required: true,
                value: formData.semester,
                onChange: handleChange,
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "First Semester", children: "First Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Second Semester", children: "Second Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Harmattan Semester", children: "Harmattan Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Rain Semester", children: "Rain Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Summer/Special Term", children: "Summer/Special Term" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Department (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "department",
                value: formData.department,
                onChange: handleChange,
                placeholder: "Computer Science",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Faculty (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "faculty",
                value: formData.faculty,
                onChange: handleChange,
                placeholder: "Faculty of Science",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Expected Sessions" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                name: "expectedSessions",
                min: "1",
                max: "60",
                value: formData.expectedSessions,
                onChange: handleChange,
                placeholder: "14",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Threshold (%) *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                name: "attendanceThreshold",
                min: "1",
                max: "100",
                required: true,
                value: formData.attendanceThreshold,
                onChange: handleChange,
                placeholder: "60",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Status *" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                name: "status",
                value: formData.status,
                onChange: handleChange,
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "ACTIVE", children: "ACTIVE" }),
                  /* @__PURE__ */ jsx("option", { value: "ARCHIVED", children: "ARCHIVED" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Course Description (Optional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "description",
              rows: 2,
              value: formData.description,
              onChange: handleChange,
              placeholder: "Course syllabus outline or lecture overview...",
              className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              onClick: onClose,
              disabled: isLoading,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "submit",
              variant: "primary",
              className: "py-2.5 px-6",
              isLoading,
              children: [
                /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 mr-1.5 text-[#d7f837]" }),
                /* @__PURE__ */ jsx("span", { children: "Save Changes" })
              ]
            }
          )
        ] })
      ] })
    }
  );
}
function DeleteCourseModal({
  isOpen,
  onClose,
  course,
  onSuccess
}) {
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    if (isOpen) {
      setConfirmInput("");
      setErrorMessage(null);
      setIsDeleting(false);
    }
  }, [isOpen]);
  if (!course) return null;
  const normalizedCode = course.code.trim().toUpperCase();
  const isConfirmed = confirmInput.trim().toUpperCase() === normalizedCode;
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to delete course.");
        setIsDeleting(false);
        return;
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      setErrorMessage("Network error occurred while deleting course.");
      setIsDeleting(false);
    }
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onClose,
      title: "Delete Academic Course",
      description: "This action is irreversible and permanently purges all course registers",
      maxWidth: "md",
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleDelete, className: "space-y-4", children: [
        errorMessage && /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium leading-relaxed", children: errorMessage })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-950 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-bold text-rose-700", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "Warning: Permanent Deletion" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-rose-800 leading-relaxed font-medium", children: [
            "You are about to permanently delete",
            " ",
            /* @__PURE__ */ jsxs("strong", { className: "text-black font-extrabold", children: [
              course.code,
              " - ",
              course.title
            ] }),
            "."
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-1 text-rose-800/90 pt-1 font-medium", children: [
            /* @__PURE__ */ jsx("li", { children: "Course workspace and lecture schedule" }),
            /* @__PURE__ */ jsx("li", { children: "All student enrolments in this course" }),
            /* @__PURE__ */ jsx("li", { children: "All attendance session records, check-ins, and reports" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-stone-700", children: [
            "To confirm deletion, please type",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-stone-100 text-black px-1.5 py-0.5 rounded border border-stone-300 font-extrabold select-all", children: course.code }),
            " ",
            "below:"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              required: true,
              value: confirmInput,
              onChange: (e) => setConfirmInput(e.target.value),
              placeholder: `Type ${course.code} to confirm`,
              className: "mt-2 block w-full px-3.5 py-2.5 text-sm border border-black/[0.15] rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white font-bold",
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              onClick: onClose,
              disabled: isDeleting,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "submit",
              variant: "destructive",
              disabled: !isConfirmed || isDeleting,
              isLoading: isDeleting,
              className: "py-2.5 px-5",
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 mr-1.5" }),
                /* @__PURE__ */ jsx("span", { children: "Permanently Delete Course" })
              ]
            }
          )
        ] })
      ] })
    }
  );
}
async function loader$b({
  request
}) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "active";
  const isArchivedTab = tab === "archived";
  const courses2 = await prisma.course.findMany({
    where: {
      lecturerId: user.id,
      status: isArchivedTab ? "ARCHIVED" : "ACTIVE"
    },
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      _count: {
        select: {
          enrolments: {
            where: {
              status: "ACTIVE"
            }
          },
          attendanceSessions: true
        }
      },
      attendanceSessions: {
        orderBy: {
          sessionDate: "desc"
        },
        take: 1,
        select: {
          sessionDate: true,
          status: true
        }
      }
    }
  });
  return {
    user,
    courses: courses2,
    isArchivedTab
  };
}
const courses = UNSAFE_withComponentProps(function CoursesPage() {
  const {
    user,
    courses: courses2,
    isArchivedTab
  } = useLoaderData();
  const revalidator = useRevalidator();
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  return /* @__PURE__ */ jsxs(DashboardLayout, {
    user,
    children: [/* @__PURE__ */ jsxs("div", {
      className: "space-y-6 sm:space-y-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]",
            children: "My Courses"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs sm:text-sm text-stone-500 font-medium mt-0.5",
            children: "Manage class rosters, start dynamic QR attendance sessions, and monitor registers"
          })]
        }), /* @__PURE__ */ jsxs(Link, {
          to: "/courses/new",
          className: "inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02] self-start sm:self-auto",
          children: [/* @__PURE__ */ jsx(PlusCircle, {
            className: "w-4 h-4 text-[#d7f837]"
          }), /* @__PURE__ */ jsx("span", {
            children: "Create New Course"
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-3 border-b border-black/[0.06]",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/courses?tab=active",
          className: `pb-3 px-2 text-xs font-bold border-b-2 transition-all ${!isArchivedTab ? "border-black text-[#111111]" : "border-transparent text-stone-400 hover:text-stone-700"}`,
          children: "Active Courses"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/courses?tab=archived",
          className: `pb-3 px-2 text-xs font-bold border-b-2 transition-all ${isArchivedTab ? "border-black text-[#111111]" : "border-transparent text-stone-400 hover:text-stone-700"}`,
          children: "Archived Courses"
        })]
      }), courses2.length === 0 ? /* @__PURE__ */ jsxs("div", {
        className: "p-10 sm:p-14 bg-white border border-black/[0.06] rounded-[28px] text-center shadow-xs space-y-3",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-12 h-12 rounded-full bg-[#edebe4] text-black mx-auto flex items-center justify-center",
          children: /* @__PURE__ */ jsx(BookOpen, {
            className: "w-6 h-6"
          })
        }), /* @__PURE__ */ jsxs("h3", {
          className: "text-base font-extrabold text-[#111111]",
          children: ["No ", isArchivedTab ? "archived" : "active", " courses found"]
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs text-stone-500 max-w-sm mx-auto font-medium leading-relaxed",
          children: isArchivedTab ? "You do not have any archived courses. Past courses you archive will appear here." : "You have not created any active courses yet. Click below to set up your first course."
        }), !isArchivedTab && /* @__PURE__ */ jsx("div", {
          className: "pt-2",
          children: /* @__PURE__ */ jsxs(Link, {
            to: "/courses/new",
            className: "inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02]",
            children: [/* @__PURE__ */ jsx(PlusCircle, {
              className: "w-4 h-4 text-[#d7f837]"
            }), /* @__PURE__ */ jsx("span", {
              children: "Create Course"
            })]
          })
        })]
      }) : /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
        children: courses2.map((course) => {
          return /* @__PURE__ */ jsxs("div", {
            className: "bg-white border border-black/[0.06] rounded-[24px] p-6 shadow-xs flex flex-col justify-between hover:border-black/20 transition-all hover:shadow-md",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-start justify-between gap-2",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-xs font-extrabold text-black bg-[#d7f837] px-2.5 py-1 rounded-full font-mono shadow-2xs",
                    children: course.code
                  }), /* @__PURE__ */ jsx(Badge, {
                    variant: course.status === "ACTIVE" ? "success" : "slate",
                    children: course.status
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-1 text-stone-400",
                  children: [/* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => setCourseToEdit(course),
                    className: "p-1.5 hover:text-black hover:bg-[#edebe4] rounded-full transition-colors",
                    title: "Edit course",
                    "aria-label": `Edit ${course.code}`,
                    children: /* @__PURE__ */ jsx(Edit2, {
                      className: "w-3.5 h-3.5"
                    })
                  }), /* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => setCourseToDelete(course),
                    className: "p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors",
                    title: "Delete course",
                    "aria-label": `Delete ${course.code}`,
                    children: /* @__PURE__ */ jsx(Trash2, {
                      className: "w-3.5 h-3.5"
                    })
                  })]
                })]
              }), /* @__PURE__ */ jsx("h3", {
                className: "mt-3 font-extrabold text-[#111111] text-base leading-snug",
                children: /* @__PURE__ */ jsx(Link, {
                  to: `/courses/${course.id}`,
                  className: "hover:underline",
                  children: course.title
                })
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-3 space-y-1.5 text-xs text-stone-500 font-medium",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-1.5",
                  children: [/* @__PURE__ */ jsx(Calendar, {
                    className: "w-3.5 h-3.5 text-stone-400"
                  }), /* @__PURE__ */ jsxs("span", {
                    children: [course.session, " • ", course.semester]
                  })]
                }), course.department && /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-1.5",
                  children: [/* @__PURE__ */ jsx(Layers, {
                    className: "w-3.5 h-3.5 text-stone-400"
                  }), /* @__PURE__ */ jsx("span", {
                    children: course.department
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-4 pt-3 border-t border-black/[0.04] grid grid-cols-2 gap-2 text-center text-xs",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "bg-[#edebe4]/50 p-2.5 rounded-xl",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-stone-400 block text-[10px] font-bold uppercase tracking-wider",
                    children: "Enrolled"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "font-extrabold text-stone-900 text-sm",
                    children: course._count.enrolments
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "bg-[#edebe4]/50 p-2.5 rounded-xl",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-stone-400 block text-[10px] font-bold uppercase tracking-wider",
                    children: "Sessions"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "font-extrabold text-stone-900 text-sm",
                    children: course._count.attendanceSessions
                  })]
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-5 pt-4 border-t border-black/[0.04] flex items-center justify-between gap-2",
              children: [/* @__PURE__ */ jsxs(Link, {
                to: `/courses/${course.id}/attendance/new`,
                className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d7f837] hover:bg-[#cbf028] text-black rounded-full text-xs font-bold shadow-2xs transition-all hover:scale-[1.02]",
                children: [/* @__PURE__ */ jsx(QrCode, {
                  className: "w-3.5 h-3.5"
                }), /* @__PURE__ */ jsx("span", {
                  children: "Take Attendance"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-1.5",
                children: [/* @__PURE__ */ jsxs("button", {
                  type: "button",
                  onClick: () => setCourseToEdit(course),
                  className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-[#edebe4] hover:bg-[#e4e2db] rounded-full transition-all shadow-2xs hover:scale-[1.02]",
                  children: [/* @__PURE__ */ jsx(Edit2, {
                    className: "w-3 h-3"
                  }), /* @__PURE__ */ jsx("span", {
                    children: "Edit"
                  })]
                }), /* @__PURE__ */ jsxs(Link, {
                  to: `/courses/${course.id}`,
                  className: "inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full transition-all shadow-2xs hover:scale-[1.02]",
                  children: [/* @__PURE__ */ jsx("span", {
                    children: "Manage"
                  }), /* @__PURE__ */ jsx(ArrowRight, {
                    className: "w-3.5 h-3.5"
                  })]
                })]
              })]
            })]
          }, course.id);
        })
      })]
    }), /* @__PURE__ */ jsx(EditCourseModal, {
      isOpen: !!courseToEdit,
      onClose: () => setCourseToEdit(null),
      course: courseToEdit,
      onSuccess: () => revalidator.revalidate()
    }), /* @__PURE__ */ jsx(DeleteCourseModal, {
      isOpen: !!courseToDelete,
      onClose: () => setCourseToDelete(null),
      course: courseToDelete,
      onSuccess: () => revalidator.revalidate()
    })]
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: courses,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
function NewCourseForm({ user }) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    department: user.department || "",
    faculty: "",
    session: "2026/2027",
    semester: "First Semester",
    classGroup: "",
    description: "",
    expectedSessions: "14",
    attendanceThreshold: "60"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        department: formData.department.trim() || void 0,
        faculty: formData.faculty.trim() || void 0,
        session: formData.session.trim(),
        semester: formData.semester.trim(),
        classGroup: formData.classGroup.trim() || void 0,
        description: formData.description.trim() || void 0,
        expectedSessions: formData.expectedSessions ? parseInt(formData.expectedSessions, 10) : void 0,
        attendanceThreshold: parseFloat(formData.attendanceThreshold) || 60
      };
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create course.");
        return;
      }
      window.location.href = `/courses/${data.course.id}`;
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/courses",
          className: "inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-black transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Back to Courses" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5 text-[#d7f837]" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight", children: "Create New Academic Course" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 font-medium", children: "Configure course metadata, academic session, and attendance requirements" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-black/[0.06] rounded-[28px] p-6 sm:p-8 shadow-xs", children: [
      errorMessage && /* @__PURE__ */ jsxs("div", { className: "mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium leading-relaxed", children: errorMessage })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Course Code *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "code",
                required: true,
                value: formData.code,
                onChange: handleChange,
                placeholder: "CSC 201",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-bold"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Course Title *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "title",
                required: true,
                value: formData.title,
                onChange: handleChange,
                placeholder: "Data Structures and Algorithms",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Academic Session *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "session",
                required: true,
                value: formData.session,
                onChange: handleChange,
                placeholder: "2026/2027",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Semester *" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                name: "semester",
                required: true,
                value: formData.semester,
                onChange: handleChange,
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "First Semester", children: "First Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Second Semester", children: "Second Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Harmattan Semester", children: "Harmattan Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Rain Semester", children: "Rain Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Summer/Special Term", children: "Summer/Special Term" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Department (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "department",
                value: formData.department,
                onChange: handleChange,
                placeholder: "Computer Science",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Faculty (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "faculty",
                value: formData.faculty,
                onChange: handleChange,
                placeholder: "Faculty of Science",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Expected Teaching Sessions" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                name: "expectedSessions",
                min: "1",
                max: "60",
                value: formData.expectedSessions,
                onChange: handleChange,
                placeholder: "14",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-stone-400 mt-1 block font-medium", children: "Total planned lectures for the semester" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Required Attendance Threshold (%)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                name: "attendanceThreshold",
                min: "1",
                max: "100",
                value: formData.attendanceThreshold,
                onChange: handleChange,
                placeholder: "60",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-stone-400 mt-1 block font-medium", children: "Standard university benchmark (e.g. 60% for exam eligibility)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-stone-700 uppercase tracking-wider", children: "Course Description (Optional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "description",
              rows: 2,
              value: formData.description,
              onChange: handleChange,
              placeholder: "Brief course objectives and lecture outline...",
              className: "mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/courses",
              className: "px-5 py-2.5 border border-black/10 text-xs font-bold text-stone-700 rounded-full hover:bg-black/5 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(Button, { type: "submit", variant: "primary", className: "py-2.5 px-6", isLoading, children: [
            /* @__PURE__ */ jsx("span", { children: "Create Course Workspace" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1.5" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
async function loader$a({
  request
}) {
  const user = await requireUser(request);
  return {
    user
  };
}
const courses_new = UNSAFE_withComponentProps(function NewCoursePage() {
  const {
    user
  } = useLoaderData();
  return /* @__PURE__ */ jsx(DashboardLayout, {
    user,
    children: /* @__PURE__ */ jsx(NewCourseForm, {
      user
    })
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: courses_new,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
function CourseWorkspaceView({
  course,
  reportData,
  initialTab,
  user
}) {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterThreshold, setFilterThreshold] = useState("all");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importError, setImportError] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    matricNumber: "",
    fullName: "",
    email: "",
    department: course.department || "",
    level: "100"
  });
  const [addingStudent, setAddingStudent] = useState(false);
  const [addError, setAddError] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    code: course.code,
    title: course.title,
    department: course.department || "",
    faculty: course.faculty || "",
    session: course.session,
    semester: course.semester,
    classGroup: course.classGroup || "",
    description: course.description || "",
    expectedSessions: course.expectedSessions ? course.expectedSessions.toString() : "",
    attendanceThreshold: course.attendanceThreshold.toString(),
    status: course.status || "ACTIVE"
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [settingsError, setSettingsError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError(null);
    setPreviewData(null);
    setImportSuccess(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/courses/${course.id}/import`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Failed to parse roster file.");
      } else {
        setPreviewData(data);
      }
    } catch {
      setImportError("Network error occurred while uploading class list.");
    } finally {
      setIsUploading(false);
    }
  };
  const handleCommitImport = async () => {
    if (!previewData?.validRows || previewData.validRows.length === 0) return;
    setIsCommitting(true);
    setImportError(null);
    try {
      const res = await fetch(`/api/courses/${course.id}/import/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: previewData.validRows,
          actionOnExisting: "update"
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Failed to commit students into roster.");
      } else {
        setImportSuccess(data.message);
        setTimeout(() => {
          setImportModalOpen(false);
          setPreviewData(null);
          setImportFile(null);
          setImportSuccess(null);
          revalidator.revalidate();
        }, 1500);
      }
    } catch {
      setImportError("Network error occurred during commit.");
    } finally {
      setIsCommitting(false);
    }
  };
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddError(null);
    setAddingStudent(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          matricNumber: newStudent.matricNumber,
          fullName: newStudent.fullName,
          email: newStudent.email || void 0,
          department: newStudent.department || void 0,
          level: newStudent.level || void 0
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to add student.");
      } else {
        setAddStudentModalOpen(false);
        setNewStudent({
          matricNumber: "",
          fullName: "",
          email: "",
          department: course.department || "",
          level: "100"
        });
        revalidator.revalidate();
      }
    } catch {
      setAddError("Network error occurred.");
    } finally {
      setAddingStudent(false);
    }
  };
  const handleWithdrawStudent = async (studentId, studentName) => {
    if (!confirm(
      `Are you sure you want to withdraw ${studentName}? Historical attendance records will remain preserved in audit logs.`
    ))
      return;
    try {
      await fetch(`/api/courses/${course.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          studentId,
          reason: "Lecturer withdrawal from course roster"
        })
      });
      revalidator.revalidate();
    } catch {
      alert("Failed to withdraw student.");
    }
  };
  const handleReEnrollStudent = async (studentId) => {
    try {
      await fetch(`/api/courses/${course.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "re-enroll", studentId })
      });
      revalidator.revalidate();
    } catch {
      alert("Failed to re-enroll student.");
    }
  };
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    setSettingsError(null);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: settingsForm.code.trim().toUpperCase(),
          title: settingsForm.title.trim(),
          department: settingsForm.department.trim() || null,
          faculty: settingsForm.faculty.trim() || null,
          session: settingsForm.session.trim(),
          semester: settingsForm.semester.trim(),
          classGroup: settingsForm.classGroup.trim() || null,
          description: settingsForm.description.trim() || null,
          expectedSessions: settingsForm.expectedSessions ? parseInt(settingsForm.expectedSessions, 10) : null,
          attendanceThreshold: parseFloat(settingsForm.attendanceThreshold) || 60,
          status: settingsForm.status
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage("Course settings updated successfully.");
        revalidator.revalidate();
      } else {
        setSettingsError(data.error || "Failed to update settings.");
      }
    } catch {
      setSettingsError("Network error occurred.");
    } finally {
      setSavingSettings(false);
    }
  };
  const filteredStudents = reportData.studentSummaries.filter((s) => {
    const matchesSearch = s.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) || s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterThreshold === "deficient") return s.isBelowThreshold;
    if (filterThreshold === "qualified") return !s.isBelowThreshold;
    return true;
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] p-6 sm:p-7 shadow-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-bold text-black bg-[#d7f837] px-3 py-1 rounded-full shadow-xs", children: course.code }),
            /* @__PURE__ */ jsx(Badge, { variant: course.status === "ACTIVE" ? "success" : "slate", children: course.status }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-[#777770]", children: [
              "Threshold: ",
              /* @__PURE__ */ jsxs("strong", { className: "text-[#111111]", children: [
                course.attendanceThreshold,
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "mt-3 text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight", children: course.title }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#777770] mt-1 font-medium", children: [
            course.session,
            " • ",
            course.semester,
            " • ",
            course.department || "Departmental Course"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 self-start md:self-auto flex-wrap", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/courses/${course.id}/attendance/new`,
              className: "inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#d7f837] hover:text-black text-white text-xs font-bold rounded-full shadow-sm transition-all",
              children: [
                /* @__PURE__ */ jsx(QrCode, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "Start Attendance Session" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("settings"),
              className: `inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${activeTab === "settings" ? "bg-[#111111] text-white border-black" : "bg-white text-stone-700 border-black/10 hover:bg-stone-50"}`,
              children: [
                /* @__PURE__ */ jsx(Settings, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Course Settings" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setDeleteModalOpen(true),
              className: "p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-black/10 hover:border-rose-200 rounded-full transition-all cursor-pointer",
              title: "Delete Course",
              "aria-label": "Delete Course",
              children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-6 border-t border-[#edebe4] mt-6 pt-4 overflow-x-auto text-xs font-bold scrollbar-none", children: [
        { id: "overview", label: "Overview", icon: BookOpen },
        { id: "roster", label: `Student Roster (${reportData.totalStudents})`, icon: Users },
        { id: "sessions", label: `Attendance Sessions (${course.attendanceSessions.length})`, icon: Clock },
        { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet },
        { id: "settings", label: "Course Settings", icon: Settings }
      ].map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab(tab.id),
            className: `flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all cursor-pointer ${active ? "border-[#111111] text-[#111111]" : "border-transparent text-[#777770] hover:text-[#111111]"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: `w-3.5 h-3.5 ${active ? "text-[#111111]" : "text-[#999990]"}` }),
              /* @__PURE__ */ jsx("span", { children: tab.label })
            ]
          },
          tab.id
        );
      }) })
    ] }),
    activeTab === "overview" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-[#777770] uppercase tracking-wider block", children: "Enrolled Students" }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold text-[#111111] mt-1 block", children: reportData.totalStudents }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[#999990]", children: "Class roster size" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-[#777770] uppercase tracking-wider block", children: "Sessions Conducted" }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold text-[#111111] mt-1 block", children: reportData.totalSessions }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[#999990]", children: "Total lectures held" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-[#777770] uppercase tracking-wider block", children: "Overall Attendance" }),
          /* @__PURE__ */ jsxs("span", { className: "text-2xl font-extrabold text-[#111111] mt-1 block", children: [
            reportData.overallAttendanceRate,
            "%"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[#999990]", children: "Average student check-in" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-[#777770] uppercase tracking-wider block", children: "Below Threshold" }),
          /* @__PURE__ */ jsx("span", { className: `text-2xl font-extrabold mt-1 block ${reportData.studentsBelowThresholdCount > 0 ? "text-rose-600" : "text-[#111111]"}`, children: reportData.studentsBelowThresholdCount }),
          /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-[#999990]", children: [
            "Students < ",
            course.attendanceThreshold,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 bg-white border border-[#e7e5df] rounded-[28px] shadow-xs flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-[#111111]", children: "Lecture Quick Actions" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#777770]", children: "Fast shortcuts for taking attendance and managing records" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setImportModalOpen(true),
              className: "gap-1.5",
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Import Class List" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/api/courses/${course.id}/reports/excel`,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-[#e7e5df] rounded-full text-[#111111] bg-white hover:bg-[#faf9f5] transition-all shadow-xs",
              children: [
                /* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-3.5 h-3.5 text-emerald-700" }),
                /* @__PURE__ */ jsx("span", { children: "Export Excel" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/api/courses/${course.id}/reports/pdf`,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-[#e7e5df] rounded-full text-[#111111] bg-white hover:bg-[#faf9f5] transition-all shadow-xs",
              children: [
                /* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5 text-rose-700" }),
                /* @__PURE__ */ jsx("span", { children: "Export PDF" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] shadow-xs p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-[#111111]", children: "Latest Attendance Sessions" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("sessions"),
              className: "text-xs font-bold text-[#111111] hover:underline",
              children: [
                "View all sessions (",
                course.attendanceSessions.length,
                ")"
              ]
            }
          )
        ] }),
        course.attendanceSessions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-10 text-[#888880]", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-8 h-8 mx-auto mb-2 opacity-40 text-[#111111]" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs", children: "No attendance sessions recorded yet for this course." }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/courses/${course.id}/attendance/new`,
              className: "mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:underline",
              children: [
                /* @__PURE__ */ jsx(QrCode, { className: "w-3.5 h-3.5 text-[#111111]" }),
                /* @__PURE__ */ jsx("span", { children: "Start First Session" })
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-[#edebe4] text-xs", children: course.attendanceSessions.slice(0, 5).map((session) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "py-3.5 flex items-center justify-between hover:bg-[#faf9f5] px-3 rounded-xl transition-colors",
            children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-[#111111]", children: session.topic || "Lecture Attendance Session" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-[#777770]", children: [
                  formatDate(session.sessionDate),
                  " • ",
                  session._count.records,
                  " present"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Badge, { variant: session.status === "OPEN" ? "warning" : "slate", children: session.status }),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: `/courses/${course.id}/attendance/${session.id}`,
                    className: "text-xs font-bold text-[#111111] hover:underline",
                    children: "Open Session"
                  }
                )
              ] })
            ]
          },
          session.id
        )) })
      ] })
    ] }),
    activeTab === "roster" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[24px] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
            /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-[#999990] absolute left-3.5 top-2.5" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search student name or matric number...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "w-full pl-9 pr-4 py-2 text-xs border border-[#e7e5df] rounded-full focus:outline-none focus:ring-2 focus:ring-[#111111]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filterThreshold,
              onChange: (e) => setFilterThreshold(e.target.value),
              className: "px-3.5 py-2 text-xs border border-[#e7e5df] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Students" }),
                /* @__PURE__ */ jsxs("option", { value: "deficient", children: [
                  "Below Threshold (<",
                  course.attendanceThreshold,
                  "%)"
                ] }),
                /* @__PURE__ */ jsx("option", { value: "qualified", children: "Qualified" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto justify-end", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setAddStudentModalOpen(true),
              className: "gap-1 text-xs",
              children: [
                /* @__PURE__ */ jsx(UserPlus, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Add Student" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "primary",
              size: "sm",
              onClick: () => setImportModalOpen(true),
              className: "gap-1 text-xs",
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Import Class List" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 text-slate-600 font-semibold border-b border-slate-200", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "S/N" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Matriculation No." }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Full Name" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Department" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Security PIN" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Attended / Eligible" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Attendance %" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: filteredStudents.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "text-center py-12 text-slate-400", children: "No students match the current filters." }) }) : filteredStudents.map((s, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/70 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-400", children: idx + 1 }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono font-bold text-slate-900", children: s.matricNumber }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-900 font-medium", children: s.fullName }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-500", children: s.department || "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: s.studentPin ? /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200", children: s.studentPin }) : /* @__PURE__ */ jsx("span", { className: "text-slate-400 text-[11px]", children: "—" }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-center text-slate-700", children: [
            /* @__PURE__ */ jsx("strong", { children: s.attendedSessions }),
            " / ",
            s.eligibleSessions
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: s.attendancePercentage !== null ? /* @__PURE__ */ jsxs(
            "span",
            {
              className: `font-bold ${s.isBelowThreshold ? "text-rose-600" : "text-emerald-700"}`,
              children: [
                s.attendancePercentage,
                "%"
              ]
            }
          ) : /* @__PURE__ */ jsx("span", { className: "text-slate-400 italic", children: "N/A" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsx(Badge, { variant: s.isBelowThreshold ? "destructive" : "success", children: s.isBelowThreshold ? "DEFICIENT" : "QUALIFIED" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: s.enrolmentStatus === "ACTIVE" ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleWithdrawStudent(s.studentId, s.fullName),
              className: "text-slate-400 hover:text-rose-600 font-semibold text-[11px]",
              children: "Withdraw"
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleReEnrollStudent(s.studentId),
              className: "text-[#111111] hover:underline font-bold text-[11px]",
              children: "Re-enroll"
            }
          ) })
        ] }, s.studentId)) })
      ] }) }) })
    ] }),
    activeTab === "sessions" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[24px] p-5 shadow-xs flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-[#111111]", children: "Course Attendance Sessions" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#777770]", children: "History of all classes and live attendance registers" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/courses/${course.id}/attendance/new`,
            className: "inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-white rounded-full text-xs font-bold hover:bg-[#d7f837] hover:text-black shadow-xs transition-all",
            children: [
              /* @__PURE__ */ jsx(QrCode, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Start New Session" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] overflow-hidden shadow-xs", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-[#faf9f5] text-[#555550] font-bold border-b border-[#edebe4]", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5", children: "Lecture Date" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5", children: "Topic / Description" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-center", children: "Students Present" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-center", children: "Attendance %" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-center", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#edebe4]", children: course.attendanceSessions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "text-center py-12 text-[#888880]", children: "No attendance sessions conducted for this course yet." }) }) : course.attendanceSessions.map((session) => {
          const present = session._count.records;
          const total = reportData.totalStudents;
          const percent = total > 0 ? Math.round(present / total * 100) : 0;
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#faf9f5] transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-medium text-[#111111]", children: formatDate(session.sessionDate) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-[#555550]", children: session.topic || "Lecture Attendance Session" }),
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3.5 text-center font-bold text-[#111111]", children: [
              present,
              " / ",
              total
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3.5 text-center font-extrabold text-[#111111]", children: [
              percent,
              "%"
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-center", children: /* @__PURE__ */ jsx(Badge, { variant: session.status === "OPEN" ? "warning" : "slate", children: session.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-right", children: /* @__PURE__ */ jsxs(
              Link,
              {
                to: `/courses/${course.id}/attendance/${session.id}`,
                className: "inline-flex items-center gap-1 text-xs font-bold text-[#111111] hover:underline",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "Open Session" }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-3 h-3" })
                ]
              }
            ) })
          ] }, session.id);
        }) })
      ] }) })
    ] }),
    activeTab === "reports" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-[#111111]", children: "Official Semester Attendance Reports" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#777770] mt-0.5", children: "Download verified semester registers formatted for departmental records and exam clearance" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/api/courses/${course.id}/reports/excel`,
              download: true,
              className: "inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold shadow-xs transition-colors",
              children: [
                /* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "Download Excel (.xlsx)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/api/courses/${course.id}/reports/pdf`,
              download: true,
              className: "inline-flex items-center gap-2 px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded-full text-xs font-bold shadow-xs transition-colors",
              children: [
                /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "Download PDF (.pdf)" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-lg p-5 shadow-xs", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider mb-3", children: "Attendance Roster & Exam Clearance Status" }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto max-h-[500px] overflow-y-auto border border-slate-200 rounded", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5", children: "S/N" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5", children: "Matriculation No." }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5", children: "Student Full Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 text-center", children: "Eligible Classes" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 text-center", children: "Present" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 text-center", children: "Absent" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 text-center", children: "Percentage" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 text-center", children: "Clearance Status" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: reportData.studentSummaries.map((s, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/60", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-slate-400", children: idx + 1 }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 font-mono font-bold text-slate-900", children: s.matricNumber }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-slate-800", children: s.fullName }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-center text-slate-600", children: s.eligibleSessions }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-center font-bold text-emerald-700", children: s.attendedSessions }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-center font-bold text-rose-600", children: s.absentSessions }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-center font-bold", children: s.attendancePercentage !== null ? `${s.attendancePercentage}%` : "N/A" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-center", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: `font-semibold px-2 py-0.5 rounded text-[11px] ${s.isBelowThreshold ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`,
                children: s.isBelowThreshold ? "DEFICIENT (Below Threshold)" : "QUALIFIED"
              }
            ) })
          ] }, s.studentId)) })
        ] }) })
      ] })
    ] }),
    activeTab === "settings" && /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs max-w-3xl space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-extrabold text-[#111111] mb-1 tracking-tight", children: "Course Configuration & Metadata" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-[#777770]", children: "Modify course details, academic semester, required attendance threshold, and course status" })
      ] }),
      settingsMessage && /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600 shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: settingsMessage })
      ] }),
      settingsError && /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: settingsError })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveSettings, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Course Code *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: settingsForm.code,
                onChange: (e) => setSettingsForm({ ...settingsForm, code: e.target.value.toUpperCase() }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-bold"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Course Title *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: settingsForm.title,
                onChange: (e) => setSettingsForm({ ...settingsForm, title: e.target.value }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Academic Session *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: settingsForm.session,
                onChange: (e) => setSettingsForm({ ...settingsForm, session: e.target.value }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Semester *" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: settingsForm.semester,
                onChange: (e) => setSettingsForm({ ...settingsForm, semester: e.target.value }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "First Semester", children: "First Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Second Semester", children: "Second Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Harmattan Semester", children: "Harmattan Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Rain Semester", children: "Rain Semester" }),
                  /* @__PURE__ */ jsx("option", { value: "Summer/Special Term", children: "Summer/Special Term" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Department (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: settingsForm.department,
                onChange: (e) => setSettingsForm({ ...settingsForm, department: e.target.value }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Faculty (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: settingsForm.faculty,
                onChange: (e) => setSettingsForm({ ...settingsForm, faculty: e.target.value }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Expected Lectures" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "60",
                value: settingsForm.expectedSessions,
                onChange: (e) => setSettingsForm({ ...settingsForm, expectedSessions: e.target.value }),
                placeholder: "14",
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Threshold (%) *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "100",
                required: true,
                value: settingsForm.attendanceThreshold,
                onChange: (e) => setSettingsForm({ ...settingsForm, attendanceThreshold: e.target.value }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Course Status *" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: settingsForm.status,
                onChange: (e) => setSettingsForm({
                  ...settingsForm,
                  status: e.target.value
                }),
                className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "ACTIVE", children: "ACTIVE" }),
                  /* @__PURE__ */ jsx("option", { value: "ARCHIVED", children: "ARCHIVED" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111] uppercase tracking-wider text-[11px]", children: "Course Description (Optional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 2,
              value: settingsForm.description,
              onChange: (e) => setSettingsForm({ ...settingsForm, description: e.target.value }),
              placeholder: "Course outline or lecture summary...",
              className: "mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-3 border-t border-[#edebe4] flex justify-end", children: /* @__PURE__ */ jsxs(Button, { type: "submit", variant: "primary", isLoading: savingSettings, children: [
          /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 mr-1 text-[#d7f837]" }),
          /* @__PURE__ */ jsx("span", { children: "Save Course Changes" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-6 border-t border-rose-200", children: /* @__PURE__ */ jsx("div", { className: "p-5 sm:p-6 bg-rose-50/70 border border-rose-200 rounded-[24px]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-sm font-extrabold text-rose-950 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 text-rose-600" }),
            /* @__PURE__ */ jsx("span", { children: "Danger Zone: Permanent Deletion" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-800/90 mt-1 max-w-md font-medium leading-relaxed", children: "Permanently delete this course, including student enrolments, attendance sessions, and check-in history. This cannot be undone." })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "destructive",
            onClick: () => setDeleteModalOpen(true),
            className: "self-start sm:self-auto shrink-0 py-2.5 px-4 text-xs font-bold",
            children: [
              /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5 mr-1.5" }),
              /* @__PURE__ */ jsx("span", { children: "Delete Course" })
            ]
          }
        )
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: importModalOpen,
        onClose: () => {
          setImportModalOpen(false);
          setPreviewData(null);
          setImportFile(null);
          setImportError(null);
        },
        title: "Import Student Class List",
        description: "Upload an Excel (.xlsx, .xls), CSV (.csv), Word (.docx), or selectable PDF (.pdf) roster.",
        maxWidth: "xl",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          importError && /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsx("span", { children: importError })
          ] }),
          importSuccess && /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsx("span", { children: importSuccess })
          ] }),
          !previewData ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-2 border-dashed border-[#e7e5df] rounded-[24px] p-8 text-center hover:border-[#111111] transition-colors bg-[#faf9f5]", children: [
              /* @__PURE__ */ jsx(FileUp, { className: "w-10 h-10 text-[#999990] mx-auto mb-3" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-[#111111]", children: "Drag and drop your class list file here, or click to browse" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#777770] mt-1", children: "Supports Excel (.xlsx, .xls), CSV, Word (.docx), and selectable text PDFs (max 10MB)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: ".xlsx,.xls,.csv,.docx,.doc,.pdf",
                  onChange: handleFileChange,
                  className: "hidden",
                  id: "class-list-file-input"
                }
              ),
              /* @__PURE__ */ jsxs(
                "label",
                {
                  htmlFor: "class-list-file-input",
                  className: "mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#d7f837] hover:text-black transition-all shadow-xs",
                  children: [
                    /* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }),
                    /* @__PURE__ */ jsx("span", { children: "Choose File" })
                  ]
                }
              )
            ] }),
            isUploading && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 text-xs text-[#111111] py-3 font-semibold", children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 text-[#111111] animate-spin" }),
              /* @__PURE__ */ jsx("span", { children: "Extracting student records and verifying leading zeros..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 flex items-center justify-between text-xs text-[#777770] border-t border-[#edebe4]", children: [
              /* @__PURE__ */ jsx("span", { children: "Need a standard spreadsheet template?" }),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "/api/courses/template/excel",
                  className: "font-bold text-[#111111] hover:underline inline-flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
                    /* @__PURE__ */ jsx("span", { children: "Download Blank Excel Template" })
                  ]
                }
              )
            ] })
          ] }) : (
            /* Preview & Reconciliation Table */
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs bg-[#faf9f5] p-3.5 rounded-2xl border border-[#e7e5df]", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-[#111111]", children: [
                    "File: ",
                    previewData.fileName
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-[#777770] mt-0.5", children: [
                    "Found ",
                    /* @__PURE__ */ jsx("strong", { children: previewData.validRows.length }),
                    " valid student records."
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      setPreviewData(null);
                      setImportFile(null);
                    },
                    className: "text-xs text-[#111111] hover:underline font-bold",
                    children: "Upload different file"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-y-auto border border-[#e7e5df] rounded-2xl overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
                /* @__PURE__ */ jsx("thead", { className: "bg-[#faf9f5] text-[#555550] sticky top-0 border-b border-[#edebe4] font-bold", children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Matric No." }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Student Name" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Department" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Status" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#edebe4]", children: previewData.validRows.slice(0, 50).map((row, i) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#faf9f5]", children: [
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-mono font-bold text-[#111111]", children: row.matricNumber }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-[#222220] font-medium", children: row.fullName }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-[#777770]", children: row.department || "—" }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: row.isAlreadyEnrolled ? /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-[#edebe4] text-[#444440] px-2 py-0.5 rounded-full font-semibold", children: "Already Enrolled (Update)" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-[#d7f837] text-black px-2 py-0.5 rounded-full font-bold", children: "New Enrolment" }) })
                ] }, i)) })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-[#edebe4] flex items-center justify-end gap-2.5", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setImportModalOpen(false);
                      setPreviewData(null);
                    },
                    className: "px-4 py-2 text-xs text-[#777770] font-bold hover:text-[#111111]",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    type: "button",
                    variant: "primary",
                    onClick: handleCommitImport,
                    isLoading: isCommitting,
                    children: [
                      "Confirm & Commit ",
                      previewData.validRows.length,
                      " Students"
                    ]
                  }
                )
              ] })
            ] })
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: addStudentModalOpen,
        onClose: () => setAddStudentModalOpen(false),
        title: "Add Student Manually",
        description: "Add an individual student to this course roster.",
        maxWidth: "md",
        children: /* @__PURE__ */ jsxs("form", { onSubmit: handleAddStudent, className: "space-y-4", children: [
          addError && /* @__PURE__ */ jsx("div", { className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800", children: addError }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-[#111111]", children: "Matriculation Number *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: newStudent.matricNumber,
                onChange: (e) => setNewStudent({ ...newStudent, matricNumber: e.target.value.toUpperCase() }),
                placeholder: "e.g. CSC/2024/045",
                className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-[#111111]", children: "Full Name *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: newStudent.fullName,
                onChange: (e) => setNewStudent({ ...newStudent, fullName: e.target.value }),
                placeholder: "Surname Firstname Middlename",
                className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-[#111111]", children: "Institutional Email (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: newStudent.email,
                onChange: (e) => setNewStudent({ ...newStudent, email: e.target.value }),
                placeholder: "student@university.edu.ng",
                className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-[#111111]", children: "Department" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: newStudent.department,
                  onChange: (e) => setNewStudent({ ...newStudent, department: e.target.value }),
                  className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-[#111111]", children: "Level" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: newStudent.level,
                  onChange: (e) => setNewStudent({ ...newStudent, level: e.target.value }),
                  className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "100", children: "100 Level" }),
                    /* @__PURE__ */ jsx("option", { value: "200", children: "200 Level" }),
                    /* @__PURE__ */ jsx("option", { value: "300", children: "300 Level" }),
                    /* @__PURE__ */ jsx("option", { value: "400", children: "400 Level" }),
                    /* @__PURE__ */ jsx("option", { value: "500", children: "500 Level" }),
                    /* @__PURE__ */ jsx("option", { value: "Postgraduate", children: "Postgraduate" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-[#edebe4] flex items-center justify-end gap-2.5", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setAddStudentModalOpen(false),
                className: "px-4 py-2 text-xs text-[#777770] font-bold hover:text-[#111111]",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(Button, { type: "submit", variant: "primary", isLoading: addingStudent, children: "Add to Roster" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      DeleteCourseModal,
      {
        isOpen: deleteModalOpen,
        onClose: () => setDeleteModalOpen(false),
        course,
        onSuccess: () => {
          navigate("/courses");
        }
      }
    )
  ] });
}
async function calculateCourseAttendance(courseId, lecturerId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lecturer: {
        select: { fullName: true, institution: true }
      },
      enrolments: {
        include: {
          student: true,
          records: true
        },
        orderBy: { student: { matricNumber: "asc" } }
      },
      attendanceSessions: {
        where: {
          status: { in: ["OPEN", "CLOSED"] }
          // exclude CANCELLED sessions
        },
        orderBy: { sessionDate: "asc" },
        include: {
          records: true
        }
      }
    }
  });
  if (!course || course.lecturerId !== lecturerId) {
    throw new Error("Course not found or unauthorized.");
  }
  const validSessions = course.attendanceSessions;
  const totalSessions = validSessions.length;
  const threshold = course.attendanceThreshold;
  const sessionsInfo = validSessions.map((s) => ({
    id: s.id,
    sessionDate: s.sessionDate,
    topic: s.topic,
    status: s.status,
    presentCount: s.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length
  }));
  let totalStudentSessionsAttended = 0;
  let totalStudentSessionsOpportunities = 0;
  let belowThresholdCount = 0;
  const studentSummaries = course.enrolments.map((enrolment) => {
    const student = enrolment.student;
    const records = enrolment.records;
    const recordBySessionId = new Map(records.map((r) => [r.sessionId, r]));
    let attended = 0;
    let excused = 0;
    let late = 0;
    let absent = 0;
    const sessionRecordMap = {};
    validSessions.forEach((sess) => {
      const rec = recordBySessionId.get(sess.id);
      if (rec) {
        if (rec.status === "PRESENT") {
          attended++;
          sessionRecordMap[sess.id] = "PRESENT";
        } else if (rec.status === "LATE") {
          attended++;
          late++;
          sessionRecordMap[sess.id] = "LATE";
        } else if (rec.status === "EXCUSED") {
          excused++;
          sessionRecordMap[sess.id] = "EXCUSED";
        } else {
          absent++;
          sessionRecordMap[sess.id] = "ABSENT";
        }
      } else {
        if (sess.status === "CLOSED") {
          absent++;
          sessionRecordMap[sess.id] = "ABSENT";
        } else {
          sessionRecordMap[sess.id] = "ABSENT";
        }
      }
    });
    const eligibleSessions = totalSessions - excused;
    const percentage = eligibleSessions > 0 ? Math.round(attended / eligibleSessions * 1e4) / 100 : null;
    let classification = "NA";
    let isBelowThreshold = false;
    if (percentage !== null) {
      if (percentage >= 90) classification = "EXCELLENT";
      else if (percentage >= 75) classification = "GOOD";
      else if (percentage >= 60) classification = "FAIR";
      else classification = "LOW";
      if (percentage < threshold) {
        isBelowThreshold = true;
        belowThresholdCount++;
      }
      totalStudentSessionsAttended += attended;
      totalStudentSessionsOpportunities += eligibleSessions;
    }
    return {
      enrolmentId: enrolment.id,
      studentId: student.id,
      matricNumber: student.matricNumber,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      level: student.level,
      studentPin: student.studentPin,
      enrolmentStatus: enrolment.status,
      eligibleSessions,
      attendedSessions: attended,
      absentSessions: absent,
      excusedSessions: excused,
      lateSessions: late,
      attendancePercentage: percentage,
      classification,
      isBelowThreshold,
      sessionRecordMap
    };
  });
  const overallAttendanceRate = totalStudentSessionsOpportunities > 0 ? Math.round(totalStudentSessionsAttended / totalStudentSessionsOpportunities * 1e4) / 100 : 0;
  return {
    course: {
      id: course.id,
      code: course.code,
      title: course.title,
      session: course.session,
      semester: course.semester,
      department: course.department,
      faculty: course.faculty,
      attendanceThreshold: threshold,
      lecturerName: course.lecturer.fullName,
      lecturerInstitution: course.lecturer.institution
    },
    totalSessions,
    totalStudents: course.enrolments.length,
    overallAttendanceRate,
    studentsBelowThresholdCount: belowThresholdCount,
    sessions: sessionsInfo,
    studentSummaries
  };
}
async function loader$9({
  request,
  params
}) {
  const user = await requireUser(request);
  const courseId = params.courseId;
  if (!courseId) {
    throw new Response("Course ID Required", {
      status: 400
    });
  }
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "overview";
  const course = await prisma.course.findUnique({
    where: {
      id: courseId
    },
    include: {
      enrolments: {
        include: {
          student: true,
          records: true
        },
        orderBy: {
          student: {
            matricNumber: "asc"
          }
        }
      },
      attendanceSessions: {
        orderBy: {
          sessionDate: "desc"
        },
        include: {
          _count: {
            select: {
              records: {
                where: {
                  status: {
                    in: ["PRESENT", "LATE"]
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  if (!course || course.lecturerId !== user.id) {
    throw new Response("Course Not Found", {
      status: 404
    });
  }
  const reportData = await calculateCourseAttendance(course.id, user.id);
  return {
    user,
    course,
    reportData,
    initialTab: tab
  };
}
const courses_$courseId = UNSAFE_withComponentProps(function CourseDetailPage() {
  const {
    user,
    course,
    reportData,
    initialTab
  } = useLoaderData();
  return /* @__PURE__ */ jsx(DashboardLayout, {
    user,
    children: /* @__PURE__ */ jsx(CourseWorkspaceView, {
      course,
      reportData,
      initialTab,
      user
    })
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: courses_$courseId,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
async function loader$8({
  request,
  params
}) {
  await requireUser(request);
  const courseId = params.courseId;
  if (!courseId) {
    return redirect("/courses");
  }
  return redirect(`/courses/${courseId}?tab=settings`);
}
const courses_$courseId_edit = UNSAFE_withComponentProps(function CourseEditRedirect() {
  return null;
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: courses_$courseId_edit,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
async function loader$7({
  request
}) {
  await requireUser(request);
  return null;
}
const courses_$courseId_attendance_new = UNSAFE_withComponentProps(function NewAttendanceSessionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params?.courseId;
  const [course, setCourse] = useState(null);
  const [topic, setTopic] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [verificationMethod, setVerificationMethod] = useState("OPEN_CHECKIN");
  const [sessionPin, setSessionPin] = useState(() => Math.floor(1e3 + Math.random() * 9e3).toString());
  const [enableInClassPin, setEnableInClassPin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    fetch(`/api/courses`).then((res) => res.json()).then((data) => {
      const found = data.courses?.find((c) => c.id === courseId);
      if (found) {
        setCourse({
          code: found.code,
          title: found.title
        });
      }
    }).catch(() => {
    }).finally(() => setLoading(false));
  }, [courseId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: topic.trim() || void 0,
          durationMinutes,
          verificationMethod,
          sessionPin: enableInClassPin ? sessionPin : void 0
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to start attendance session.");
        return;
      }
      navigate(`/courses/${courseId}/attendance/${data.session.id}`);
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-[#faf9f5] flex items-center justify-center",
      children: /* @__PURE__ */ jsx(Loader2, {
        className: "w-8 h-8 text-[#111111] animate-spin"
      })
    });
  }
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen bg-[#faf9f5] py-10 px-4 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-xl mx-auto",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-6",
        children: [/* @__PURE__ */ jsxs(Link, {
          to: `/courses/${courseId}`,
          className: "inline-flex items-center gap-1.5 text-xs font-bold text-[#777770] hover:text-[#111111] transition-colors",
          children: [/* @__PURE__ */ jsx(ArrowLeft, {
            className: "w-4 h-4"
          }), /* @__PURE__ */ jsx("span", {
            children: "Back to Course Workspace"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-4 flex items-center gap-3",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-11 h-11 rounded-2xl bg-[#111111] text-[#d7f837] flex items-center justify-center font-bold shadow-xs",
            children: /* @__PURE__ */ jsx(QrCode, {
              className: "w-5 h-5"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsxs("h1", {
              className: "text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight",
              children: ["Start Lecture Attendance: ", course?.code || "Course"]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-[#777770] font-medium",
              children: course?.title
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs",
        children: [errorMessage && /* @__PURE__ */ jsxs("div", {
          className: "mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2",
          children: [/* @__PURE__ */ jsx(AlertCircle, {
            className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5"
          }), /* @__PURE__ */ jsx("span", {
            children: errorMessage
          })]
        }), /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-6",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-xs font-bold text-[#111111]",
              children: "Lecture Topic or Session Title (Optional)"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: topic,
              onChange: (e) => setTopic(e.target.value),
              placeholder: "e.g. Week 4: Recursion & Binary Trees",
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }), /* @__PURE__ */ jsx("span", {
              className: "text-[11px] text-[#888880] mt-1 block",
              children: "Helps identify this class in the semester attendance matrix"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-xs font-bold text-[#111111]",
              children: "Check-in Window Duration"
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-2 grid grid-cols-4 gap-2.5",
              children: [15, 30, 45, 60].map((mins) => /* @__PURE__ */ jsxs("button", {
                type: "button",
                onClick: () => setDurationMinutes(mins),
                className: `py-2 text-xs font-bold rounded-full border text-center transition-all cursor-pointer ${durationMinutes === mins ? "bg-[#111111] border-[#111111] text-white shadow-xs" : "bg-white border-[#e7e5df] text-[#555550] hover:bg-[#faf9f5]"}`,
                children: [mins, " mins"]
              }, mins))
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-xs font-bold text-[#111111] mb-2",
              children: "Student Identity Verification Method"
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2.5",
              children: [/* @__PURE__ */ jsxs("label", {
                className: `flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${verificationMethod === "OPEN_CHECKIN" ? "border-[#111111] bg-[#faf9f5]" : "border-[#e7e5df] bg-white hover:border-[#ccc]"}`,
                children: [/* @__PURE__ */ jsx("input", {
                  type: "radio",
                  name: "verificationMethod",
                  value: "OPEN_CHECKIN",
                  checked: verificationMethod === "OPEN_CHECKIN",
                  onChange: () => setVerificationMethod("OPEN_CHECKIN"),
                  className: "mt-1 accent-black"
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsxs("span", {
                    className: "text-xs font-bold text-[#111111] flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx("span", {
                      children: "In-Class QR Code & PIN"
                    }), /* @__PURE__ */ jsx("span", {
                      className: "text-[10px] bg-[#d7f837] text-black px-2 py-0.5 rounded-full font-bold",
                      children: "Recommended"
                    })]
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-[11px] text-[#777770] leading-relaxed block mt-0.5",
                    children: "Fastest & most seamless. Scanning the classroom QR code auto-verifies physical presence and pre-fills the PIN for students."
                  })]
                })]
              }), /* @__PURE__ */ jsxs("label", {
                className: `flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${verificationMethod === "STUDENT_PIN" ? "border-[#111111] bg-[#faf9f5]" : "border-[#e7e5df] bg-white hover:border-[#ccc]"}`,
                children: [/* @__PURE__ */ jsx("input", {
                  type: "radio",
                  name: "verificationMethod",
                  value: "STUDENT_PIN",
                  checked: verificationMethod === "STUDENT_PIN",
                  onChange: () => setVerificationMethod("STUDENT_PIN"),
                  className: "mt-1 accent-black"
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-xs font-bold text-[#111111] block",
                    children: "Personal Student PIN"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-[11px] text-[#777770] leading-relaxed block mt-0.5",
                    children: "Requires students to enter an individual security PIN previously assigned to their matriculation number."
                  })]
                })]
              }), /* @__PURE__ */ jsxs("label", {
                className: `flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${verificationMethod === "EMAIL_OTP" ? "border-[#111111] bg-[#faf9f5]" : "border-[#e7e5df] bg-white hover:border-[#ccc]"}`,
                children: [/* @__PURE__ */ jsx("input", {
                  type: "radio",
                  name: "verificationMethod",
                  value: "EMAIL_OTP",
                  checked: verificationMethod === "EMAIL_OTP",
                  onChange: () => setVerificationMethod("EMAIL_OTP"),
                  className: "mt-1 accent-black"
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-xs font-bold text-[#111111] block",
                    children: "Institutional Email Passcode (OTP)"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-[11px] text-[#777770] leading-relaxed block mt-0.5",
                    children: "Dispatches a single-use numeric code to the student's registered institutional inbox."
                  })]
                })]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "p-4 bg-[#faf9f5] border border-[#e7e5df] rounded-2xl",
            children: [/* @__PURE__ */ jsxs("label", {
              className: "flex items-center justify-between cursor-pointer",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("span", {
                  className: "text-xs font-bold text-[#111111] block",
                  children: "Project In-Class Session PIN"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-[11px] text-[#777770] block mt-0.5",
                  children: "Displays a 4-digit code on the classroom projector screen to verify physical attendance."
                })]
              }), /* @__PURE__ */ jsx("input", {
                type: "checkbox",
                checked: enableInClassPin,
                onChange: (e) => setEnableInClassPin(e.target.checked),
                className: "rounded accent-black w-4 h-4 cursor-pointer"
              })]
            }), enableInClassPin && /* @__PURE__ */ jsxs("div", {
              className: "mt-3.5 pt-3.5 border-t border-[#edebe4] flex items-center justify-between",
              children: [/* @__PURE__ */ jsx("span", {
                className: "text-xs font-bold text-[#777770]",
                children: "Projected Code:"
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2.5",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "font-mono text-base font-extrabold text-[#111111] bg-white px-3.5 py-1 rounded-full border border-[#e7e5df] tracking-widest shadow-xs",
                  children: sessionPin
                }), /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setSessionPin(Math.floor(1e3 + Math.random() * 9e3).toString()),
                  className: "text-xs text-[#111111] hover:underline font-bold cursor-pointer",
                  children: "Regenerate"
                })]
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "pt-2",
            children: /* @__PURE__ */ jsx(Button, {
              type: "submit",
              variant: "primary",
              className: "w-full py-3 font-bold",
              isLoading: submitting,
              children: "Start Attendance & Display QR"
            })
          })]
        })]
      })]
    })
  });
});
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: courses_$courseId_attendance_new,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
async function loader$6({
  request
}) {
  await requireUser(request);
  return null;
}
const courses_$courseId_attendance_$sessionId = UNSAFE_withComponentProps(function LiveAttendanceSessionPage() {
  const params = useParams();
  useNavigate();
  const courseId = params?.courseId;
  const sessionId = params?.sessionId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [closing, setClosing] = useState(false);
  const [extending, setExtending] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedEnrolmentId, setSelectedEnrolmentId] = useState("");
  const [overrideStatus, setOverrideStatus] = useState("PRESENT");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [overrideError, setOverrideError] = useState(null);
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/sessions/${sessionId}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error("Error polling session data:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, sessionId]);
  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3e3);
    return () => clearInterval(interval);
  }, [fetchSession]);
  useEffect(() => {
    if (!data?.session) return;
    const updateCountdown = () => {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const expiry = new Date(data.session.expiresAt).getTime();
      const diff = expiry - now;
      if (data.session.status === "CLOSED" || diff <= 0) {
        setTimeLeft("Session Closed");
      } else {
        const mins = Math.floor(diff / (1e3 * 60));
        const secs = Math.floor(diff % (1e3 * 60) / 1e3);
        setTimeLeft(`${mins}m ${secs < 10 ? "0" : ""}${secs}s remaining`);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1e3);
    return () => clearInterval(timer);
  }, [data]);
  const handleCopyLink = () => {
    const urlToCopy = data?.qrTargetUrl || data?.checkInUrl;
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const handleCloseSession = async () => {
    if (!confirm("Are you sure you want to close this attendance session? New student check-ins will be stopped.")) return;
    setClosing(true);
    try {
      await fetch(`/api/courses/${courseId}/sessions/${sessionId}/close`, {
        method: "POST"
      });
      fetchSession();
    } catch {
      alert("Failed to close session");
    } finally {
      setClosing(false);
    }
  };
  const handleExtendSession = async () => {
    setExtending(true);
    try {
      await fetch(`/api/courses/${courseId}/sessions/${sessionId}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          minutes: 10
        })
      });
      fetchSession();
    } catch {
      alert("Failed to extend session");
    } finally {
      setExtending(false);
    }
  };
  const handleManualOverride = async (e) => {
    e.preventDefault();
    if (!selectedEnrolmentId) {
      setOverrideError("Please select a student");
      return;
    }
    if (!overrideReason.trim()) {
      setOverrideError("A valid reason for manual attendance correction is mandatory.");
      return;
    }
    setOverrideError(null);
    setOverrideSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/sessions/${sessionId}/override`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enrolmentId: selectedEnrolmentId,
          status: overrideStatus,
          reason: overrideReason
        })
      });
      const resData = await res.json();
      if (!res.ok) {
        setOverrideError(resData.error || "Failed to record manual override.");
        return;
      }
      setOverrideModalOpen(false);
      setSelectedEnrolmentId("");
      setOverrideReason("");
      fetchSession();
    } catch {
      setOverrideError("Network error occurred.");
    } finally {
      setOverrideSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-[#faf9f5] flex items-center justify-center",
      children: /* @__PURE__ */ jsx(RefreshCw, {
        className: "w-8 h-8 text-[#111111] animate-spin"
      })
    });
  }
  if (!data?.session) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-[#faf9f5] flex items-center justify-center p-4",
      children: /* @__PURE__ */ jsxs("div", {
        className: "text-center bg-white p-8 rounded-[28px] border border-[#e7e5df] shadow-sm max-w-sm",
        children: [/* @__PURE__ */ jsx(AlertCircle, {
          className: "w-10 h-10 text-rose-600 mx-auto mb-3"
        }), /* @__PURE__ */ jsx("h2", {
          className: "text-base font-extrabold text-[#111111]",
          children: "Attendance Session Not Found"
        }), /* @__PURE__ */ jsx(Link, {
          to: `/courses/${courseId}`,
          className: "text-xs font-bold text-[#111111] underline mt-3 block hover:text-black",
          children: "Return to course workspace"
        })]
      })
    });
  }
  const session = data.session;
  const isSessionClosed = session.status === "CLOSED" || new Date(session.expiresAt) < /* @__PURE__ */ new Date();
  const presentCount = data.presentCount || 0;
  const totalEnrolled = data.totalEnrolled || 0;
  const percentPresent = totalEnrolled > 0 ? Math.round(presentCount / totalEnrolled * 100) : 0;
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#faf9f5] text-[#111111] pb-16",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "border-b border-[#e7e5df] bg-white sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-3",
        children: [/* @__PURE__ */ jsx(Link, {
          to: `/courses/${courseId}`,
          className: "w-9 h-9 rounded-full bg-[#edebe4] text-[#444440] hover:bg-[#111111] hover:text-[#d7f837] flex items-center justify-center transition-all cursor-pointer",
          children: /* @__PURE__ */ jsx(ArrowLeft, {
            className: "w-4 h-4"
          })
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2.5",
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-extrabold text-[#111111] text-sm sm:text-base font-mono",
              children: session.course?.code
            }), /* @__PURE__ */ jsx(Badge, {
              variant: isSessionClosed ? "slate" : "success",
              children: isSessionClosed ? "CLOSED" : "ACTIVE SESSION"
            })]
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs text-[#777770] font-medium truncate max-w-sm",
            children: session.topic || "Lecture Attendance Session"
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-2.5",
        children: [!isSessionClosed && /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsxs("button", {
            onClick: handleExtendSession,
            disabled: extending,
            className: "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-[#e7e5df] rounded-full text-xs font-bold text-[#111111] bg-white hover:bg-[#faf9f5] disabled:opacity-50 transition-all cursor-pointer shadow-xs",
            children: [/* @__PURE__ */ jsx(Clock, {
              className: "w-3.5 h-3.5"
            }), /* @__PURE__ */ jsx("span", {
              children: "+10 Mins"
            })]
          }), /* @__PURE__ */ jsxs("button", {
            onClick: handleCloseSession,
            disabled: closing,
            className: "inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer",
            children: [/* @__PURE__ */ jsx(PowerOff, {
              className: "w-3.5 h-3.5"
            }), /* @__PURE__ */ jsx("span", {
              children: "Close Attendance"
            })]
          })]
        }), /* @__PURE__ */ jsxs(Button, {
          size: "sm",
          variant: "outline",
          onClick: () => setOverrideModalOpen(true),
          className: "gap-1.5 cursor-pointer",
          children: [/* @__PURE__ */ jsx(Plus, {
            className: "w-3.5 h-3.5"
          }), /* @__PURE__ */ jsx("span", {
            children: "Manual Override"
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6",
      children: /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "lg:col-span-5 space-y-5",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs text-center flex flex-col items-center",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "w-full flex items-center justify-between pb-3.5 border-b border-[#edebe4] text-xs",
              children: [/* @__PURE__ */ jsx("span", {
                className: "font-bold text-[#777770] uppercase tracking-wider",
                children: "Classroom QR Code"
              }), /* @__PURE__ */ jsx("span", {
                className: "font-bold text-[#111111] bg-[#faf9f5] px-3 py-1 rounded-full border border-[#e7e5df]",
                children: timeLeft
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "my-5 p-4 bg-white border border-[#e7e5df] rounded-2xl shadow-xs inline-block",
              children: data.qrCodeDataUrl ? /* @__PURE__ */ jsx("img", {
                src: data.qrCodeDataUrl,
                alt: "Attendance Check-In QR Code",
                className: "w-64 h-64 sm:w-72 sm:h-72 mx-auto"
              }) : /* @__PURE__ */ jsx("div", {
                className: "w-64 h-64 flex items-center justify-center text-xs text-[#888880]",
                children: "Generating QR code..."
              })
            }), session.sessionPin && /* @__PURE__ */ jsxs("div", {
              className: "w-full bg-[#faf9f5] border border-[#e7e5df] rounded-2xl p-4 mb-4",
              children: [/* @__PURE__ */ jsx("span", {
                className: "text-[11px] font-bold text-[#777770] uppercase block tracking-wider",
                children: "In-Class Attendance PIN"
              }), /* @__PURE__ */ jsx("span", {
                className: "text-3xl font-mono font-extrabold tracking-widest text-[#111111] mt-1 block",
                children: session.sessionPin
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "w-full flex items-center gap-2",
              children: [/* @__PURE__ */ jsx("input", {
                type: "text",
                readOnly: true,
                value: data.qrTargetUrl || data.checkInUrl,
                className: "flex-1 px-4 py-2 text-xs bg-[#faf9f5] border border-[#e7e5df] rounded-full text-[#555550] font-mono truncate"
              }), /* @__PURE__ */ jsxs("button", {
                onClick: handleCopyLink,
                className: "px-4 py-2 text-xs font-bold bg-[#111111] hover:bg-[#d7f837] hover:text-black text-white rounded-full flex items-center gap-1.5 shrink-0 cursor-pointer transition-all shadow-xs",
                children: [copied ? /* @__PURE__ */ jsx(Check, {
                  className: "w-3.5 h-3.5"
                }) : /* @__PURE__ */ jsx(Copy, {
                  className: "w-3.5 h-3.5"
                }), /* @__PURE__ */ jsx("span", {
                  children: copied ? "Copied" : "Copy Link"
                })]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "bg-white border border-[#e7e5df] rounded-[28px] p-6 shadow-xs",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between text-xs mb-2.5",
              children: [/* @__PURE__ */ jsx("span", {
                className: "font-bold text-[#777770] uppercase",
                children: "Live Attendance Rate"
              }), /* @__PURE__ */ jsxs("span", {
                className: "font-extrabold text-[#111111]",
                children: [percentPresent, "% Present"]
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "w-full bg-[#edebe4] rounded-full h-3 overflow-hidden",
              children: /* @__PURE__ */ jsx("div", {
                className: "bg-[#111111] h-3 rounded-full transition-all duration-500",
                style: {
                  width: `${percentPresent}%`
                }
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex justify-between items-center text-xs text-[#555550] mt-4 pt-3 border-t border-[#edebe4] font-medium",
              children: [/* @__PURE__ */ jsxs("span", {
                children: ["Present: ", /* @__PURE__ */ jsx("strong", {
                  className: "text-[#111111]",
                  children: presentCount
                }), " students"]
              }), /* @__PURE__ */ jsxs("span", {
                children: ["Total Enrolled: ", /* @__PURE__ */ jsx("strong", {
                  className: "text-[#111111]",
                  children: totalEnrolled
                })]
              })]
            })]
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "lg:col-span-7",
          children: /* @__PURE__ */ jsxs("div", {
            className: "bg-white border border-[#e7e5df] rounded-[28px] shadow-xs overflow-hidden flex flex-col h-full",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "px-6 py-5 border-b border-[#edebe4] flex items-center justify-between bg-[#faf9f5]",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsxs("h3", {
                  className: "text-sm font-bold text-[#111111]",
                  children: ["Live Session Register (", session.records.length, ")"]
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-xs text-[#777770] mt-0.5",
                  children: "Real-time check-in entries verified by ClassMark attendance server"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-1.5 text-[11px] text-[#777770] font-semibold",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "w-2.5 h-2.5 rounded-full bg-[#d7f837] border border-black animate-pulse"
                }), /* @__PURE__ */ jsx("span", {
                  children: "Polling Active"
                })]
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "overflow-x-auto flex-1 max-h-[600px] overflow-y-auto",
              children: session.records.length === 0 ? /* @__PURE__ */ jsxs("div", {
                className: "py-20 text-center text-[#888880]",
                children: [/* @__PURE__ */ jsx(Users, {
                  className: "w-10 h-10 mx-auto mb-3 opacity-40 text-[#111111]"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-xs font-bold text-[#111111]",
                  children: "No student check-ins recorded yet"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-[11px] mt-1 text-[#777770] max-w-xs mx-auto",
                  children: "As students scan the QR code and verify identity, entries will appear here instantly."
                })]
              }) : /* @__PURE__ */ jsxs("table", {
                className: "w-full text-left text-xs",
                children: [/* @__PURE__ */ jsx("thead", {
                  className: "bg-[#faf9f5] text-[#555550] font-bold border-b border-[#edebe4] sticky top-0",
                  children: /* @__PURE__ */ jsxs("tr", {
                    children: [/* @__PURE__ */ jsx("th", {
                      className: "px-4 py-3",
                      children: "S/N"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "px-4 py-3",
                      children: "Matriculation No"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "px-4 py-3",
                      children: "Student Name"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "px-4 py-3",
                      children: "Check-In Time"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "px-4 py-3",
                      children: "Status"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "px-4 py-3",
                      children: "Verification"
                    })]
                  })
                }), /* @__PURE__ */ jsx("tbody", {
                  className: "divide-y divide-[#edebe4]",
                  children: session.records.map((rec, idx) => {
                    const student = rec.enrolment?.student;
                    return /* @__PURE__ */ jsxs("tr", {
                      className: "hover:bg-[#faf9f5] transition-colors",
                      children: [/* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 text-[#999990]",
                        children: idx + 1
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 font-mono font-bold text-[#111111]",
                        children: student?.matricNumber
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 text-[#222220] font-medium",
                        children: student?.fullName
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 text-[#777770]",
                        children: new Date(rec.checkInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5",
                        children: /* @__PURE__ */ jsx(Badge, {
                          variant: rec.status === "PRESENT" ? "success" : rec.status === "EXCUSED" ? "warning" : "slate",
                          children: rec.status
                        })
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 text-[#555550]",
                        children: rec.isManualOverride ? /* @__PURE__ */ jsx("span", {
                          className: "text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold",
                          children: "Manual Override"
                        }) : /* @__PURE__ */ jsxs("span", {
                          className: "text-[11px] text-emerald-700 font-semibold",
                          children: ["Verified (", rec.verificationMethod, ")"]
                        })
                      })]
                    }, rec.id);
                  })
                })]
              })
            })]
          })
        })]
      })
    }), /* @__PURE__ */ jsx(Modal, {
      isOpen: overrideModalOpen,
      onClose: () => setOverrideModalOpen(false),
      title: "Manual Attendance Correction",
      description: "Record or adjust attendance for a student with mandatory audit logging.",
      maxWidth: "md",
      children: /* @__PURE__ */ jsxs("form", {
        onSubmit: handleManualOverride,
        className: "space-y-4",
        children: [overrideError && /* @__PURE__ */ jsx("div", {
          className: "p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800",
          children: overrideError
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-xs font-bold text-[#111111]",
            children: "Select Student *"
          }), /* @__PURE__ */ jsxs("select", {
            required: true,
            value: selectedEnrolmentId,
            onChange: (e) => setSelectedEnrolmentId(e.target.value),
            className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium",
            children: [/* @__PURE__ */ jsx("option", {
              value: "",
              children: "-- Choose enrolled student --"
            }), data?.enrolledStudents?.map((s) => /* @__PURE__ */ jsxs("option", {
              value: s.enrolmentId,
              children: [s.matricNumber, " - ", s.fullName]
            }, s.enrolmentId))]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-xs font-bold text-[#111111]",
            children: "Attendance Status *"
          }), /* @__PURE__ */ jsxs("select", {
            value: overrideStatus,
            onChange: (e) => setOverrideStatus(e.target.value),
            className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium",
            children: [/* @__PURE__ */ jsx("option", {
              value: "PRESENT",
              children: "PRESENT"
            }), /* @__PURE__ */ jsx("option", {
              value: "EXCUSED",
              children: "EXCUSED ABSENCE"
            }), /* @__PURE__ */ jsx("option", {
              value: "LATE",
              children: "LATE ARRIVAL"
            }), /* @__PURE__ */ jsx("option", {
              value: "ABSENT",
              children: "ABSENT"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-xs font-bold text-[#111111]",
            children: "Reason for Override / Adjustment *"
          }), /* @__PURE__ */ jsx("textarea", {
            required: true,
            rows: 3,
            value: overrideReason,
            onChange: (e) => setOverrideReason(e.target.value),
            placeholder: "e.g. Student present in class; mobile device battery depleted / official medical excuse.",
            className: "mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-[11px] text-[#888880] mt-1 block",
            children: "Required for institutional audit trail. Logged with your lecturer ID."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "pt-4 border-t border-[#edebe4] flex items-center justify-end gap-2.5",
          children: [/* @__PURE__ */ jsx("button", {
            type: "button",
            onClick: () => setOverrideModalOpen(false),
            className: "px-4 py-2 text-xs font-bold text-[#777770] hover:text-[#111111] cursor-pointer",
            children: "Cancel"
          }), /* @__PURE__ */ jsx(Button, {
            type: "submit",
            variant: "primary",
            isLoading: overrideSubmitting,
            children: "Apply Correction"
          })]
        })]
      })
    })]
  });
});
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: courses_$courseId_attendance_$sessionId,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
async function loader$5({
  request,
  params
}) {
  const user = await requireUser(request);
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("Student ID Required", {
      status: 400
    });
  }
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      enrolments: {
        some: {
          course: {
            lecturerId: user.id
          }
        }
      }
    },
    include: {
      enrolments: {
        where: {
          course: {
            lecturerId: user.id
          }
        },
        include: {
          course: {
            include: {
              attendanceSessions: {
                orderBy: {
                  sessionDate: "desc"
                }
              }
            }
          },
          records: {
            include: {
              session: true
            },
            orderBy: {
              checkInTime: "desc"
            }
          }
        }
      }
    }
  });
  if (!student) {
    throw new Response("Student Not Found", {
      status: 404
    });
  }
  return {
    user,
    student
  };
}
const students_$studentId = UNSAFE_withComponentProps(function StudentDetailPage() {
  const {
    user,
    student
  } = useLoaderData();
  return /* @__PURE__ */ jsx(DashboardLayout, {
    user,
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-6 max-w-5xl",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsxs(Link, {
          to: "/courses",
          className: "inline-flex items-center gap-1.5 text-xs font-bold text-[#777770] hover:text-[#111111] transition-colors",
          children: [/* @__PURE__ */ jsx(ArrowLeft, {
            className: "w-4 h-4"
          }), /* @__PURE__ */ jsx("span", {
            children: "Back to Courses"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-4 flex items-center gap-3.5",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-11 h-11 rounded-2xl bg-[#111111] text-[#d7f837] flex items-center justify-center font-bold shadow-xs",
            children: /* @__PURE__ */ jsx(User, {
              className: "w-5 h-5"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("h1", {
              className: "text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight",
              children: student.fullName
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-xs text-[#777770] font-mono mt-0.5",
              children: ["Matriculation Number: ", /* @__PURE__ */ jsx("strong", {
                className: "text-[#111111]",
                children: student.matricNumber
              }), student.department && ` • ${student.department}`, student.level && ` • ${student.level} Level`]
            })]
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "space-y-6",
        children: student.enrolments.map((enrolment) => {
          const course = enrolment.course;
          const records = enrolment.records;
          const validSessions = course.attendanceSessions;
          const totalSessions = validSessions.length;
          const attended = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
          const excused = records.filter((r) => r.status === "EXCUSED").length;
          const eligible = totalSessions - excused;
          const percent = eligible > 0 ? Math.round(attended / eligible * 1e3) / 10 : null;
          const isBelow = percent !== null && percent < course.attendanceThreshold;
          return /* @__PURE__ */ jsxs("div", {
            className: "bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs space-y-5",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#edebe4] gap-3",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("span", {
                  className: "font-mono text-xs font-bold text-black bg-[#d7f837] px-3 py-1 rounded-full shadow-xs",
                  children: course.code
                }), /* @__PURE__ */ jsx("h3", {
                  className: "text-lg font-bold text-[#111111] mt-2",
                  children: course.title
                }), /* @__PURE__ */ jsxs("p", {
                  className: "text-xs text-[#777770] mt-0.5",
                  children: [course.session, " • ", course.semester, " • Minimum Requirement:", " ", course.attendanceThreshold, "%"]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "text-right",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-[11px] text-[#888880] block font-bold uppercase tracking-wider",
                    children: "ATTENDANCE RATE"
                  }), /* @__PURE__ */ jsx("span", {
                    className: `text-2xl font-extrabold ${isBelow ? "text-rose-600" : "text-[#111111]"}`,
                    children: percent !== null ? `${percent}%` : "N/A"
                  })]
                }), /* @__PURE__ */ jsx(Badge, {
                  variant: isBelow ? "destructive" : "success",
                  children: isBelow ? "DEFICIENT" : "QUALIFIED"
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h4", {
                className: "text-xs font-bold text-[#111111] uppercase tracking-wider mb-3",
                children: "Class Attendance Register Log"
              }), records.length === 0 ? /* @__PURE__ */ jsx("p", {
                className: "text-xs text-[#888880] italic py-3",
                children: "No attendance events recorded for this student in this course."
              }) : /* @__PURE__ */ jsx("div", {
                className: "overflow-x-auto border border-[#e7e5df] rounded-2xl overflow-hidden",
                children: /* @__PURE__ */ jsxs("table", {
                  className: "w-full text-left text-xs",
                  children: [/* @__PURE__ */ jsx("thead", {
                    className: "bg-[#faf9f5] text-[#555550] font-bold border-b border-[#edebe4]",
                    children: /* @__PURE__ */ jsxs("tr", {
                      children: [/* @__PURE__ */ jsx("th", {
                        className: "px-4 py-3",
                        children: "Session Date"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "px-4 py-3",
                        children: "Lecture Topic"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "px-4 py-3",
                        children: "Status"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "px-4 py-3",
                        children: "Check-in Timestamp"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "px-4 py-3",
                        children: "Verification Method"
                      }), /* @__PURE__ */ jsx("th", {
                        className: "px-4 py-3",
                        children: "Audit Notes"
                      })]
                    })
                  }), /* @__PURE__ */ jsx("tbody", {
                    className: "divide-y divide-[#edebe4]",
                    children: records.map((rec) => /* @__PURE__ */ jsxs("tr", {
                      className: "hover:bg-[#faf9f5] transition-colors",
                      children: [/* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 font-medium text-[#111111]",
                        children: formatDate(rec.session.sessionDate)
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 text-[#555550]",
                        children: rec.session.topic || "Lecture Class"
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5",
                        children: /* @__PURE__ */ jsx(Badge, {
                          variant: rec.status === "PRESENT" ? "success" : rec.status === "EXCUSED" ? "warning" : "slate",
                          children: rec.status
                        })
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 text-[#777770]",
                        children: formatDateTime(rec.checkInTime)
                      }), /* @__PURE__ */ jsxs("td", {
                        className: "px-4 py-2.5 text-[#555550]",
                        children: [rec.verificationMethod, " (", rec.verificationStatus, ")"]
                      }), /* @__PURE__ */ jsx("td", {
                        className: "px-4 py-2.5 text-[#777770]",
                        children: rec.isManualOverride ? /* @__PURE__ */ jsxs("span", {
                          className: "text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200",
                          children: ["Manual: ", rec.overrideReason || "Lecturer override"]
                        }) : "—"
                      })]
                    }, rec.id))
                  })]
                })
              })]
            })]
          }, enrolment.id);
        })
      })]
    })
  });
});
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: students_$studentId,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
function StudentCheckInContent() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const token = params?.token;
  const pinFromUrl = searchParams.get("pin") || "";
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [matricNumber, setMatricNumber] = useState("");
  const [sessionPin, setSessionPin] = useState(pinFromUrl);
  const [studentPin, setStudentPin] = useState("");
  const [showStudentPin, setShowStudentPin] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [studentLookup, setStudentLookup] = useState({
    isChecking: false,
    found: false
  });
  const [otpSent, setOtpSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  useEffect(() => {
    try {
      const savedMatric = localStorage.getItem("classmark_student_matric");
      if (savedMatric && !matricNumber) {
        setMatricNumber(savedMatric);
      }
    } catch {
    }
  }, []);
  useEffect(() => {
    if (pinFromUrl && !sessionPin) {
      setSessionPin(pinFromUrl);
    }
  }, [pinFromUrl, sessionPin]);
  useEffect(() => {
    if (!token) return;
    fetch(`/api/attendance/${token}`).then((res) => res.json()).then((data) => {
      if (data.error) {
        setSessionError(data.error);
      } else {
        setSession(data);
      }
    }).catch(() => {
      setSessionError("Failed to connect to university attendance server.");
    }).finally(() => {
      setLoadingSession(false);
    });
  }, [token]);
  const lookupStudent = useCallback(async (matric) => {
    const clean = matric.trim().toUpperCase().replace(/\\/g, "/");
    if (clean.length < 3) {
      setStudentLookup({
        isChecking: false,
        found: false
      });
      return;
    }
    setStudentLookup((prev) => ({
      ...prev,
      isChecking: true
    }));
    try {
      const res = await fetch(`/api/attendance/${token}/lookup?matric=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.found) {
        setStudentLookup({
          isChecking: false,
          found: true,
          studentName: data.student.fullName,
          matricNumber: data.student.matricNumber,
          department: data.student.department,
          hasStudentPin: data.student.hasStudentPin,
          devStudentPin: data.student.devStudentPin,
          alreadyRecorded: data.alreadyRecorded,
          formattedCheckInTime: data.formattedCheckInTime
        });
      } else {
        setStudentLookup({
          isChecking: false,
          found: false,
          error: data.message || "Matriculation number not found in course register."
        });
      }
    } catch {
      setStudentLookup({
        isChecking: false,
        found: false
      });
    }
  }, [token]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (matricNumber.trim().length >= 3) {
        lookupStudent(matricNumber);
      } else {
        setStudentLookup({
          isChecking: false,
          found: false
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [matricNumber, lookupStudent]);
  const handleRequestOtp = async () => {
    if (!matricNumber.trim()) {
      setFormError("Please enter your matriculation number first.");
      return;
    }
    setFormError(null);
    setSendingOtp(true);
    try {
      const res = await fetch(`/api/attendance/${token}/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matricNumber: matricNumber.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to send verification code.");
      } else {
        setOtpSent(true);
        setMaskedEmail(data.maskedEmail);
        if (data.devOtp) setDevOtp(data.devOtp);
      }
    } catch {
      setFormError("Network error occurred while requesting verification code.");
    } finally {
      setSendingOtp(false);
    }
  };
  const handleClearSavedStudent = () => {
    try {
      localStorage.removeItem("classmark_student_matric");
    } catch {
    }
    setMatricNumber("");
    setStudentLookup({
      isChecking: false,
      found: false
    });
    setFormError(null);
  };
  const handleCheckIn = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    const cleanMatric = matricNumber.trim().toUpperCase().replace(/\\/g, "/");
    let deviceFingerprint = "";
    try {
      deviceFingerprint = localStorage.getItem("classmark_device_id") || "";
      if (!deviceFingerprint) {
        deviceFingerprint = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("classmark_device_id", deviceFingerprint);
      }
    } catch {
    }
    try {
      const res = await fetch(`/api/attendance/${token}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matricNumber: cleanMatric,
          sessionPin: sessionPin.trim(),
          studentPin: studentPin.trim(),
          otpCode: otpCode.trim(),
          deviceId: deviceFingerprint
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.alreadyRecorded) {
          setConfirmation({
            studentName: data.studentName || studentLookup.studentName || "Enrolled Student",
            matricNumber: data.matricNumber || cleanMatric,
            courseCode: data.courseCode || session?.courseCode || "Course Attendance",
            checkInTime: data.checkInTime || (/* @__PURE__ */ new Date()).toISOString()
          });
        } else {
          setFormError(data.error || "Attendance check-in was declined.");
        }
      } else {
        try {
          localStorage.setItem("classmark_student_matric", cleanMatric);
        } catch {
        }
        setConfirmation({
          studentName: data.studentName,
          matricNumber: data.matricNumber,
          courseCode: data.courseCode,
          checkInTime: data.checkInTime
        });
      }
    } catch {
      setFormError("Network connection interrupted. Please check your data connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loadingSession) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-[#faf9f5] flex items-center justify-center p-4",
      children: /* @__PURE__ */ jsxs("div", {
        className: "text-center",
        children: [/* @__PURE__ */ jsx(Loader2, {
          className: "w-8 h-8 text-[#111111] animate-spin mx-auto mb-3"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs font-bold text-[#111111]",
          children: "Connecting to lecture hall register..."
        })]
      })
    });
  }
  if (sessionError || !session) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-[#faf9f5] flex flex-col justify-center py-12 px-4 sm:px-6",
      children: /* @__PURE__ */ jsxs("div", {
        className: "max-w-md mx-auto bg-white border border-[#e7e5df] rounded-[28px] p-8 shadow-sm text-center",
        children: [/* @__PURE__ */ jsx(AlertCircle, {
          className: "w-12 h-12 text-rose-600 mx-auto mb-3"
        }), /* @__PURE__ */ jsx("h2", {
          className: "text-base font-extrabold text-[#111111]",
          children: "Attendance Session Unavailable"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs text-[#777770] mt-2 leading-relaxed",
          children: sessionError || "The attendance session could not be found or the link has expired."
        }), /* @__PURE__ */ jsx("div", {
          className: "mt-6 pt-4 border-t border-[#edebe4]",
          children: /* @__PURE__ */ jsx("p", {
            className: "text-[11px] text-[#888880]",
            children: "Please notify your lecturer if you are physically in class and unable to connect."
          })
        })]
      })
    });
  }
  const isClosed = session.status === "CLOSED";
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-[#faf9f5] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "sm:mx-auto sm:w-full sm:max-w-md text-center",
      children: [/* @__PURE__ */ jsx("div", {
        className: "inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111111] text-[#d7f837] shadow-sm mb-3",
        children: /* @__PURE__ */ jsx(GraduationCap, {
          className: "w-6 h-6"
        })
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight",
        children: session.courseCode
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs sm:text-sm text-[#555550] font-medium px-2 mt-0.5",
        children: session.courseTitle
      }), session.lecturerName && /* @__PURE__ */ jsxs("p", {
        className: "text-[11px] text-[#777770] mt-0.5 font-medium",
        children: ["Lecturer: ", session.lecturerName]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-[#e7e5df] text-[#111111] shadow-2xs",
        children: [/* @__PURE__ */ jsx(Clock, {
          className: "w-3.5 h-3.5 text-[#111111]"
        }), /* @__PURE__ */ jsxs("span", {
          children: [session.academicSession, " • ", session.semester]
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-6 sm:mx-auto sm:w-full sm:max-w-md",
      children: /* @__PURE__ */ jsx("div", {
        className: "bg-white py-7 px-6 sm:px-8 shadow-sm border border-[#e7e5df] rounded-[28px]",
        children: confirmation ? (
          /* Celebration confirmation */
          /* @__PURE__ */ jsxs("div", {
            className: "text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner",
              children: /* @__PURE__ */ jsx(CheckCircle2, {
                className: "w-10 h-10 text-emerald-600"
              })
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("span", {
                className: "inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 mb-1.5",
                children: [/* @__PURE__ */ jsx(Sparkles, {
                  className: "w-3.5 h-3.5 text-emerald-600"
                }), "Attendance Confirmed"]
              }), /* @__PURE__ */ jsx("h3", {
                className: "text-xl font-bold text-slate-900",
                children: "You are Marked PRESENT!"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-xs text-slate-500 mt-1",
                children: "Your classroom presence has been verified in the university register."
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2.5",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex justify-between border-b border-slate-200/60 pb-1.5",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "text-slate-500 font-medium",
                  children: "Student Name:"
                }), /* @__PURE__ */ jsx("span", {
                  className: "font-bold text-slate-900",
                  children: confirmation.studentName
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex justify-between border-b border-slate-200/60 pb-1.5",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "text-slate-500 font-medium",
                  children: "Matriculation No:"
                }), /* @__PURE__ */ jsx("span", {
                  className: "font-mono font-bold text-slate-900",
                  children: confirmation.matricNumber
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex justify-between border-b border-slate-200/60 pb-1.5",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "text-slate-500 font-medium",
                  children: "Course:"
                }), /* @__PURE__ */ jsx("span", {
                  className: "font-bold text-slate-900",
                  children: confirmation.courseCode
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex justify-between",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "text-slate-500 font-medium",
                  children: "Recorded Time:"
                }), /* @__PURE__ */ jsx("span", {
                  className: "font-bold text-emerald-700",
                  children: new Date(confirmation.checkInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })
                })]
              })]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-slate-500 pt-1",
              children: "Your matric number is saved on this device for 1-tap check-in next time!"
            }), /* @__PURE__ */ jsx("div", {
              className: "pt-2",
              children: /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => window.close(),
                className: "w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors",
                children: "Close Window"
              })
            })]
          })
        ) : isClosed ? (
          /* Closed Session Notice */
          /* @__PURE__ */ jsxs("div", {
            className: "text-center py-6 space-y-3",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto",
              children: /* @__PURE__ */ jsx(Clock, {
                className: "w-7 h-7"
              })
            }), /* @__PURE__ */ jsx("h3", {
              className: "text-lg font-bold text-slate-800",
              children: "Attendance Session Closed"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-slate-600 max-w-xs mx-auto leading-relaxed",
              children: "Attendance submissions for this lecture have ended. Check-ins are no longer accepted."
            }), /* @__PURE__ */ jsx("p", {
              className: "text-[11px] text-slate-400 pt-3 border-t border-slate-100",
              children: "If you were physically in class and missed the window, please notify your lecturer immediately."
            })]
          })
        ) : (
          /* Seamless Check-in Form */
          /* @__PURE__ */ jsxs("form", {
            onSubmit: handleCheckIn,
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "border-b border-slate-100 pb-3",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-between",
                children: [/* @__PURE__ */ jsx("h3", {
                  className: "text-sm font-bold text-slate-900",
                  children: "Lecture Check-In"
                }), /* @__PURE__ */ jsxs("span", {
                  className: "inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                  }), "Live Register"]
                })]
              }), /* @__PURE__ */ jsx("p", {
                className: "text-xs text-slate-500 mt-0.5 truncate",
                children: session.topic || "Confirm your physical classroom presence"
              })]
            }), formError && /* @__PURE__ */ jsxs("div", {
              className: "p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2",
              children: [/* @__PURE__ */ jsx(AlertCircle, {
                className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5"
              }), /* @__PURE__ */ jsx("span", {
                className: "leading-relaxed",
                children: formError
              })]
            }), studentLookup.alreadyRecorded && /* @__PURE__ */ jsxs("div", {
              className: "p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5",
              children: [/* @__PURE__ */ jsx(CheckCircle2, {
                className: "w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
              }), /* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-bold",
                  children: "You are already marked present!"
                }), /* @__PURE__ */ jsxs("p", {
                  className: "mt-0.5 text-emerald-800",
                  children: ["Attendance for ", /* @__PURE__ */ jsx("strong", {
                    children: studentLookup.studentName
                  }), " was already recorded at ", studentLookup.formattedCheckInTime, ". You do not need to sign in again."]
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-between",
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-xs font-bold text-slate-700",
                  children: "Matriculation / Student ID *"
                }), studentLookup.found && /* @__PURE__ */ jsxs("button", {
                  type: "button",
                  onClick: handleClearSavedStudent,
                  className: "text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1",
                  children: [/* @__PURE__ */ jsx(RotateCcw, {
                    className: "w-3 h-3"
                  }), /* @__PURE__ */ jsx("span", {
                    children: "Change ID"
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-1.5 relative",
                children: [/* @__PURE__ */ jsx("input", {
                  type: "text",
                  required: true,
                  autoFocus: !matricNumber,
                  value: matricNumber,
                  onChange: (e) => setMatricNumber(e.target.value.toUpperCase()),
                  placeholder: "e.g. CSC/2024/001",
                  className: "block w-full px-4 py-3 text-base border border-[#e7e5df] rounded-xl uppercase font-mono tracking-wide placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                }), studentLookup.isChecking && /* @__PURE__ */ jsx("div", {
                  className: "absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none",
                  children: /* @__PURE__ */ jsx(Loader2, {
                    className: "w-4 h-4 text-[#111111] animate-spin"
                  })
                })]
              }), studentLookup.found ? /* @__PURE__ */ jsxs("div", {
                className: "mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900",
                children: [/* @__PURE__ */ jsx(UserCheck, {
                  className: "w-4 h-4 text-emerald-600 shrink-0"
                }), /* @__PURE__ */ jsxs("div", {
                  className: "min-w-0 flex-1",
                  children: [/* @__PURE__ */ jsx("p", {
                    className: "font-bold truncate",
                    children: studentLookup.studentName
                  }), /* @__PURE__ */ jsxs("p", {
                    className: "text-[11px] text-emerald-700 truncate",
                    children: [studentLookup.department || "Enrolled Student", " • ", studentLookup.matricNumber]
                  })]
                })]
              }) : studentLookup.error && matricNumber.trim().length >= 3 ? /* @__PURE__ */ jsxs("p", {
                className: "mt-2 text-[11px] text-rose-600 flex items-center gap-1",
                children: [/* @__PURE__ */ jsx(AlertCircle, {
                  className: "w-3.5 h-3.5 shrink-0"
                }), /* @__PURE__ */ jsx("span", {
                  children: studentLookup.error
                })]
              }) : /* @__PURE__ */ jsx("p", {
                className: "mt-1.5 text-[11px] text-[#888880]",
                children: "Device will remember your matriculation number for future lectures."
              })]
            }), session.requiresInClassPin && /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-between",
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-xs font-bold text-[#111111]",
                  children: "In-Class PIN (Projected on Board) *"
                }), pinFromUrl && sessionPin === pinFromUrl && /* @__PURE__ */ jsx("span", {
                  className: "text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200",
                  children: "✓ Auto-filled from QR code"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-1.5 relative",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888880]",
                  children: /* @__PURE__ */ jsx(KeyRound, {
                    className: "w-4 h-4"
                  })
                }), /* @__PURE__ */ jsx("input", {
                  type: "text",
                  required: true,
                  maxLength: 6,
                  value: sessionPin,
                  onChange: (e) => setSessionPin(e.target.value.trim()),
                  placeholder: "4-digit PIN on classroom screen",
                  className: "block w-full pl-10 pr-4 py-3 text-base border border-[#e7e5df] rounded-xl font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                })]
              })]
            }), session.verificationMethod === "STUDENT_PIN" && /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-between",
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-xs font-bold text-[#111111]",
                  children: "Personal Student Security PIN *"
                }), studentLookup.devStudentPin && /* @__PURE__ */ jsxs("span", {
                  className: "text-[10px] font-bold text-[#111111] bg-[#faf9f5] px-2.5 py-0.5 rounded-full border border-[#d7f837] font-mono",
                  children: ["Dev / Test PIN: ", studentLookup.devStudentPin]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-1.5 relative",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888880]",
                  children: /* @__PURE__ */ jsx(Lock, {
                    className: "w-4 h-4"
                  })
                }), /* @__PURE__ */ jsx("input", {
                  type: showStudentPin ? "text" : "password",
                  required: true,
                  maxLength: 6,
                  value: studentPin,
                  onChange: (e) => setStudentPin(e.target.value),
                  placeholder: "Enter your personal 4-digit PIN",
                  className: "block w-full pl-10 pr-10 py-3 text-base border border-[#e7e5df] rounded-xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                }), /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => setShowStudentPin(!showStudentPin),
                  className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#888880] hover:text-[#111111] focus:outline-none cursor-pointer",
                  children: showStudentPin ? /* @__PURE__ */ jsx(EyeOff, {
                    className: "w-4 h-4"
                  }) : /* @__PURE__ */ jsx(Eye, {
                    className: "w-4 h-4"
                  })
                })]
              }), /* @__PURE__ */ jsx("span", {
                className: "text-[11px] text-[#888880] block mt-1",
                children: "Confidential personal PIN assigned on course roster"
              })]
            }), session.verificationMethod === "EMAIL_OTP" && /* @__PURE__ */ jsxs("div", {
              className: "pt-2 border-t border-[#edebe4] space-y-3",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-between",
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-xs font-bold text-[#111111]",
                  children: "Email Passcode *"
                }), !otpSent && /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: handleRequestOtp,
                  disabled: sendingOtp || !matricNumber.trim(),
                  className: "text-xs font-bold text-[#111111] hover:underline disabled:opacity-50 cursor-pointer",
                  children: sendingOtp ? "Sending code..." : "Send Code to My Email"
                })]
              }), otpSent ? /* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsxs("p", {
                  className: "text-xs text-emerald-700 mb-2 font-medium",
                  children: ["Passcode sent to ", /* @__PURE__ */ jsx("strong", {
                    children: maskedEmail
                  }), "."]
                }), devOtp && /* @__PURE__ */ jsxs("p", {
                  className: "text-[11px] text-[#111111] bg-[#faf9f5] p-2.5 rounded-xl mb-2 border border-[#d7f837] font-mono",
                  children: ["Dev Passcode: ", /* @__PURE__ */ jsx("strong", {
                    children: devOtp
                  })]
                }), /* @__PURE__ */ jsx("input", {
                  type: "text",
                  required: true,
                  maxLength: 6,
                  value: otpCode,
                  onChange: (e) => setOtpCode(e.target.value.trim()),
                  placeholder: "Enter 6-digit code",
                  className: "block w-full px-4 py-2.5 text-center text-lg font-mono tracking-widest border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-bold"
                })]
              }) : /* @__PURE__ */ jsxs("div", {
                className: "p-3.5 bg-[#faf9f5] border border-[#e7e5df] rounded-2xl text-xs text-[#555550]",
                children: ["Tap ", /* @__PURE__ */ jsx("strong", {
                  children: "Send Code to My Email"
                }), " to receive your check-in passcode."]
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "pt-3",
              children: /* @__PURE__ */ jsxs(Button, {
                type: "submit",
                variant: "primary",
                className: "w-full py-3.5 text-sm sm:text-base font-bold shadow-sm transition-all",
                isLoading: isSubmitting,
                disabled: studentLookup.alreadyRecorded,
                children: [/* @__PURE__ */ jsx(ShieldCheck, {
                  className: "w-4 h-4 mr-1.5"
                }), /* @__PURE__ */ jsx("span", {
                  children: studentLookup.alreadyRecorded ? "Attendance Already Confirmed" : "Confirm My Attendance"
                })]
              })
            }), /* @__PURE__ */ jsx("div", {
              className: "pt-1 text-center",
              children: /* @__PURE__ */ jsx("span", {
                className: "text-[11px] text-slate-400",
                children: "Physical presence required. Institutional attendance policy applies."
              })
            })]
          })
        )
      })
    })]
  });
}
const attendance_$token = UNSAFE_withComponentProps(function StudentCheckInPage() {
  return /* @__PURE__ */ jsx(StudentCheckInContent, {});
});
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: attendance_$token
}, Symbol.toStringTag, { value: "Module" }));
function SettingsForm({ user, smtpConfigured }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    institution: user.institution || "",
    department: user.department || "",
    timeZone: user.timeZone || "Africa/Lagos",
    defaultThreshold: user.defaultThreshold?.toString() || "60",
    defaultSessionDuration: user.defaultSessionDuration?.toString() || "30",
    defaultVerificationMethod: user.defaultVerificationMethod || "STUDENT_PIN",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMsg("New passwords do not match.");
        return;
      }
      if (!formData.currentPassword) {
        setErrorMsg("Please provide your current password to update it.");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          institution: formData.institution,
          department: formData.department,
          timeZone: formData.timeZone,
          defaultThreshold: parseFloat(formData.defaultThreshold) || 60,
          defaultSessionDuration: parseInt(formData.defaultSessionDuration, 10) || 30,
          defaultVerificationMethod: formData.defaultVerificationMethod,
          currentPassword: formData.currentPassword || void 0,
          newPassword: formData.newPassword || void 0
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update settings.");
      } else {
        setSuccessMsg("Settings updated successfully.");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    successMsg && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600 shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: successMsg })
    ] }),
    errorMsg && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: errorMsg })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-[#111111] mb-5 pb-3 border-b border-[#edebe4] flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-[#111111]" }),
        /* @__PURE__ */ jsx("span", { children: "Lecturer Profile" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Full Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              required: true,
              value: formData.fullName,
              onChange: (e) => setFormData({ ...formData, fullName: e.target.value }),
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Institutional Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              disabled: true,
              value: user.email,
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] bg-[#faf9f5] text-[#777770] rounded-xl cursor-not-allowed font-medium"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[#888880] mt-1 block", children: "Email address cannot be changed directly" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "University / Tertiary Institution" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.institution,
              onChange: (e) => setFormData({ ...formData, institution: e.target.value }),
              placeholder: "e.g. Obafemi Awolowo University",
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Department" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.department,
              onChange: (e) => setFormData({ ...formData, department: e.target.value }),
              placeholder: "e.g. Computer Science & Engineering",
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-[#111111] mb-5 pb-3 border-b border-[#edebe4] flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-[#111111]" }),
        /* @__PURE__ */ jsx("span", { children: "Attendance Preferences" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Default Time Zone" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: formData.timeZone,
              onChange: (e) => setFormData({ ...formData, timeZone: e.target.value }),
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium",
              children: [
                /* @__PURE__ */ jsx("option", { value: "Africa/Lagos", children: "Africa/Lagos (WAT, UTC+1)" }),
                /* @__PURE__ */ jsx("option", { value: "UTC", children: "UTC" }),
                /* @__PURE__ */ jsx("option", { value: "Africa/Accra", children: "Africa/Accra (GMT)" }),
                /* @__PURE__ */ jsx("option", { value: "Africa/Johannesburg", children: "Africa/Johannesburg (SAST, UTC+2)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Default Session Duration" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: formData.defaultSessionDuration,
              onChange: (e) => setFormData({ ...formData, defaultSessionDuration: e.target.value }),
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium",
              children: [
                /* @__PURE__ */ jsx("option", { value: "15", children: "15 minutes" }),
                /* @__PURE__ */ jsx("option", { value: "30", children: "30 minutes" }),
                /* @__PURE__ */ jsx("option", { value: "45", children: "45 minutes" }),
                /* @__PURE__ */ jsx("option", { value: "60", children: "60 minutes" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Default Attendance Threshold (%)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              max: "100",
              value: formData.defaultThreshold,
              onChange: (e) => setFormData({ ...formData, defaultThreshold: e.target.value }),
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-[#111111] mb-5 pb-3 border-b border-[#edebe4] flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-[#111111]" }),
        /* @__PURE__ */ jsx("span", { children: "Security & Password Update" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Current Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              value: formData.currentPassword,
              onChange: (e) => setFormData({ ...formData, currentPassword: e.target.value }),
              placeholder: "Enter current password",
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "New Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              minLength: 8,
              value: formData.newPassword,
              onChange: (e) => setFormData({ ...formData, newPassword: e.target.value }),
              placeholder: "Min. 8 characters",
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-[#111111]", children: "Confirm New Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              minLength: 8,
              value: formData.confirmPassword,
              onChange: (e) => setFormData({ ...formData, confirmPassword: e.target.value }),
              placeholder: "Re-enter new password",
              className: "mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 bg-[#faf9f5] border border-[#e7e5df] rounded-[24px] text-xs text-[#555550]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-bold text-[#111111] mb-1.5", children: [
        /* @__PURE__ */ jsx(Info, { className: "w-4 h-4 text-[#111111]" }),
        /* @__PURE__ */ jsx("span", { children: "System Environment & Mail Dispatch Status" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 leading-relaxed", children: smtpConfigured ? "Production SMTP server is actively connected for transactional email dispatch." : "Running in local development mode: verification links and OTP codes are safely transparent and logged directly to the server terminal." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", variant: "primary", isLoading: saving, children: "Save Preferences" }) })
  ] });
}
async function loader$4({
  request
}) {
  const user = await requireUser(request);
  const smtpConfigured = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST && process.env.SMTP_USER);
  return {
    user,
    smtpConfigured
  };
}
const settings = UNSAFE_withComponentProps(function SettingsPage() {
  const {
    user,
    smtpConfigured
  } = useLoaderData();
  return /* @__PURE__ */ jsx(DashboardLayout, {
    user,
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-4xl space-y-6",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]",
          children: "Account & System Settings"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs sm:text-sm text-[#777770] mt-1 font-medium",
          children: "Configure your lecturer profile, default attendance rules, and security preferences"
        })]
      }), /* @__PURE__ */ jsx(SettingsForm, {
        user,
        smtpConfigured
      })]
    })
  });
});
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: settings,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
const storage = /* @__PURE__ */ new Map();
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      if (record.resetAt <= now) {
        storage.delete(key);
      }
    }
  }, 5 * 60 * 1e3).unref?.();
}
function checkRateLimit(key, config2) {
  const now = Date.now();
  const record = storage.get(key);
  if (!record || record.resetAt <= now) {
    storage.set(key, {
      count: 1,
      resetAt: now + config2.windowMs
    });
    return {
      success: true,
      limit: config2.maxRequests,
      remaining: config2.maxRequests - 1,
      resetAt: now + config2.windowMs,
      retryAfterSeconds: 0
    };
  }
  if (record.count >= config2.maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1e3));
    return {
      success: false,
      limit: config2.maxRequests,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterSeconds
    };
  }
  record.count += 1;
  return {
    success: true,
    limit: config2.maxRequests,
    remaining: config2.maxRequests - record.count,
    resetAt: record.resetAt,
    retryAfterSeconds: 0
  };
}
function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
function resetRateLimit(key) {
  storage.delete(key);
}
const DEFAULT_SECURITY_HEADERS = {
  // Prevent clickjacking by forbidding embedding in iframes
  "X-Frame-Options": "DENY",
  // Prevent browsers from MIME-sniffing away from declared Content-Type
  "X-Content-Type-Options": "nosniff",
  // Referrer policy protecting sensitive route information while preserving origin for analytics
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Restrict access to sensitive browser features (camera, microphone, payment)
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(self)",
  // Legacy XSS filter protection for older browsers
  "X-XSS-Protection": "1; mode=block",
  // Strict Transport Security (HSTS) - 1 year with subdomains in production
  ...process.env.NODE_ENV === "production" ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" } : {}
};
function applySecurityHeaders(response) {
  for (const [header, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
    if (!response.headers.has(header)) {
      response.headers.set(header, value);
    }
  }
  return response;
}
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
async function action$6({
  request
}) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({
      error: "Method not allowed"
    }, {
      status: 405
    }));
  }
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`login:ip:${clientIp}`, {
    maxRequests: 25,
    windowMs: 15 * 60 * 1e3
  });
  if (!ipLimit.success) {
    return applySecurityHeaders(Response.json({
      error: "Too many login attempts from this network. Please wait a few minutes before trying again."
    }, {
      status: 429,
      headers: {
        "Retry-After": String(ipLimit.retryAfterSeconds)
      }
    }));
  }
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return applySecurityHeaders(Response.json({
        error: "Please provide a valid email and password"
      }, {
        status: 400
      }));
    }
    const {
      email,
      password
    } = result.data;
    const normalizedEmail = email.toLowerCase().trim();
    const accountLimit = checkRateLimit(`login:account:${normalizedEmail}`, {
      maxRequests: 6,
      windowMs: 15 * 60 * 1e3
    });
    if (!accountLimit.success) {
      return applySecurityHeaders(Response.json({
        error: "Too many failed sign-in attempts for this account. Please wait a few minutes or reset your password."
      }, {
        status: 429,
        headers: {
          "Retry-After": String(accountLimit.retryAfterSeconds)
        }
      }));
    }
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });
    if (!user) {
      return applySecurityHeaders(Response.json({
        error: "Invalid email or password."
      }, {
        status: 401
      }));
    }
    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return applySecurityHeaders(Response.json({
        error: "Invalid email or password."
      }, {
        status: 401
      }));
    }
    resetRateLimit(`login:account:${normalizedEmail}`);
    if (!user.isEmailVerified) {
      const isEmailConfigured = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
      if (!isEmailConfigured || process.env.NODE_ENV !== "production") {
        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            isEmailVerified: true
          }
        });
      } else {
        return applySecurityHeaders(Response.json({
          error: "Your email address is not yet verified. Please check your inbox or verification link.",
          unverified: true,
          email: user.email
        }, {
          status: 403
        }));
      }
    }
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);
    return applySecurityHeaders(Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        institution: user.institution
      }
    }, {
      status: 200,
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    }));
  } catch (error) {
    console.error("[Login Action Error]:", error);
    return applySecurityHeaders(Response.json({
      error: "An authentication error occurred. Please try again."
    }, {
      status: 500
    }));
  }
}
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6
}, Symbol.toStringTag, { value: "Module" }));
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || "ClassMark <noreply@classmarker.online>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://classmarker.online" : "http://localhost:3000");
let transporter = null;
if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}
async function sendEmail({
  to,
  subject,
  html,
  text
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      let from = process.env.EMAIL_FROM || "ClassMark <noreply@classmarker.online>";
      if (from.includes("onboarding@resend.dev")) {
        from = "ClassMark <noreply@classmarker.online>";
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          text
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Resend API Delivery Error]:", errorData);
        throw new Error(`Resend email delivery failed: ${errorData.message || response.statusText}`);
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, simulated: false, messageId: data.id };
    } catch (error) {
      console.error("[Email Delivery Error via Resend]:", error);
      throw error;
    }
  }
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        text,
        html
      });
      return { success: true, simulated: false, messageId: info.messageId };
    } catch (error) {
      console.error("[Email Delivery Error via SMTP]:", error);
      throw new Error("Failed to deliver email through SMTP server.");
    }
  }
  console.log(`
========================================================`);
  console.log(`[CLASSMARK LOCAL EMAIL DISPATCH] (SMTP/Resend not configured)`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message Body:
${text}`);
  console.log(`========================================================
`);
  return { success: true, simulated: true };
}
async function sendVerificationEmail(email, token) {
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;
  const subject = "Verify your ClassMark Lecturer Account";
  const text = `Welcome to ClassMark.

Please verify your institutional email address by opening the following link:
${verifyUrl}

This verification link expires in 24 hours.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0369a1; margin-top: 0;">ClassMark Verification</h2>
      <p>Welcome to ClassMark, your university attendance management platform.</p>
      <p>Please click the button below to verify your email address and activate your account:</p>
      <div style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background-color: #0369a1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser:</p>
      <p style="color: #0369a1; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">This link will expire in 24 hours. If you did not create a ClassMark account, you can safely ignore this email.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, text, html });
}
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  const subject = "Reset your ClassMark Password";
  const text = `You requested a password reset for your ClassMark account.

Please use the following link to set a new password:
${resetUrl}

This link is single-use and expires in 1 hour.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0369a1; margin-top: 0;">Password Reset Request</h2>
      <p>We received a request to reset the password for your ClassMark lecturer account.</p>
      <div style="margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #0369a1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Or paste this link into your browser:</p>
      <p style="color: #0369a1; font-size: 14px; word-break: break-all;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">This link is valid for 1 hour. If you did not request a password reset, no action is needed.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, text, html });
}
async function sendStudentOtpEmail(email, otpCode, courseCode) {
  const subject = `[ClassMark] Check-in Verification Code for ${courseCode}`;
  const text = `Your attendance check-in verification code for ${courseCode} is: ${otpCode}

This one-time passcode is valid for 10 minutes. Do not share this code with anyone.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="color: #0369a1; margin-top: 0;">Attendance Check-In Code</h3>
      <p>You are verifying your presence in <strong>${courseCode}</strong>.</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #0f172a; font-family: monospace;">${otpCode}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This single-use code is valid for 10 minutes. Enter it on the attendance page to confirm your check-in.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, text, html });
}
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid institutional email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().optional(),
  institution: z.string().max(150).optional(),
  department: z.string().max(100).optional(),
  agreeTerms: z.boolean().optional()
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
async function action$5({
  request
}) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({
      error: "Method not allowed"
    }, {
      status: 405
    }));
  }
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`register:ip:${clientIp}`, {
    maxRequests: 12,
    windowMs: 60 * 60 * 1e3
  });
  if (!ipLimit.success) {
    return applySecurityHeaders(Response.json({
      error: "Too many registration attempts. Please wait an hour before trying again."
    }, {
      status: 429,
      headers: {
        "Retry-After": String(ipLimit.retryAfterSeconds)
      }
    }));
  }
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = fieldErrors.confirmPassword?.[0] || fieldErrors.password?.[0] || fieldErrors.email?.[0] || fieldErrors.fullName?.[0] || "Please check your input details and try again.";
      return applySecurityHeaders(Response.json({
        error: firstError,
        details: fieldErrors
      }, {
        status: 400
      }));
    }
    const {
      fullName,
      email,
      password,
      institution,
      department
    } = result.data;
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });
    if (existing) {
      return applySecurityHeaders(Response.json({
        error: "An account with this email address already exists. Please sign in instead."
      }, {
        status: 409
      }));
    }
    const passwordHash = await hashPassword(password);
    const isEmailConfigured = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    const shouldRequireVerification = isEmailConfigured && process.env.NODE_ENV === "production";
    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        passwordHash,
        institution: institution || null,
        department: department || null,
        isEmailVerified: !shouldRequireVerification,
        timeZone: "Africa/Lagos"
      }
    });
    let emailDispatched = false;
    let emailErrorDetails = null;
    if (isEmailConfigured) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await prisma.emailVerificationToken.create({
        data: {
          token: rawToken,
          userId: user.id,
          expiresAt
        }
      });
      try {
        await sendVerificationEmail(user.email, rawToken);
        emailDispatched = true;
      } catch (emailError) {
        emailErrorDetails = emailError?.message || "Email dispatch failed";
        console.error("[Email Dispatch Error]:", emailErrorDetails);
      }
    }
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);
    return applySecurityHeaders(Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        institution: user.institution,
        isEmailVerified: user.isEmailVerified
      },
      requiresVerification: shouldRequireVerification,
      emailDispatched,
      emailError: emailErrorDetails
    }, {
      status: 201,
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    }));
  } catch (error) {
    console.error("[Register Action Error]:", error);
    if (error?.code === "P2002") {
      return applySecurityHeaders(Response.json({
        error: "An account with this email address already exists. Please sign in instead."
      }, {
        status: 409
      }));
    }
    const message = process.env.NODE_ENV !== "production" && error?.message ? `Registration error: ${error.message}` : "Registration failed due to a server error. Please try again.";
    return applySecurityHeaders(Response.json({
      error: message
    }, {
      status: 500
    }));
  }
}
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
async function loader$3({
  request
}) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        authenticated: false,
        user: null
      }, {
        status: 401
      });
    }
    return Response.json({
      authenticated: true,
      user
    });
  } catch {
    return Response.json({
      authenticated: false,
      user: null
    }, {
      status: 401
    });
  }
}
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
async function action$4({
  request
}) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return Response.json({
    success: true
  }, {
    status: 200,
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}
async function loader$2({
  request
}) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return Response.json({
    success: true
  }, {
    status: 200,
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const forgotPasswordSchema = z.object({
  email: z.string().email()
});
async function action$3({
  request
}) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({
      error: "Method not allowed"
    }, {
      status: 405
    }));
  }
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`forgot-password:ip:${clientIp}`, {
    maxRequests: 6,
    windowMs: 15 * 60 * 1e3
  });
  if (!ipLimit.success) {
    return applySecurityHeaders(Response.json({
      error: "Too many password reset requests. Please wait a few minutes before trying again."
    }, {
      status: 429,
      headers: {
        "Retry-After": String(ipLimit.retryAfterSeconds)
      }
    }));
  }
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return applySecurityHeaders(Response.json({
        error: "Please enter a valid email address."
      }, {
        status: 400
      }));
    }
    const email = result.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (user) {
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id
        }
      });
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt
        }
      });
      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (err) {
        console.error("[Email send error]:", err);
      }
    }
    return applySecurityHeaders(Response.json({
      success: true,
      message: "If an account exists with this email address, password reset instructions have been sent."
    }));
  } catch (error) {
    console.error("[Forgot Password Error]:", error);
    return applySecurityHeaders(Response.json({
      error: "An error occurred while processing your request."
    }, {
      status: 500
    }));
  }
}
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3
}, Symbol.toStringTag, { value: "Module" }));
const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
async function action$2({
  request
}) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({
      error: "Method not allowed"
    }, {
      status: 405
    }));
  }
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`reset-password:ip:${clientIp}`, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1e3
  });
  if (!ipLimit.success) {
    return applySecurityHeaders(Response.json({
      error: "Too many password reset attempts. Please wait a few minutes."
    }, {
      status: 429,
      headers: {
        "Retry-After": String(ipLimit.retryAfterSeconds)
      }
    }));
  }
  try {
    const body = await request.json();
    const result = resetSchema.safeParse(body);
    if (!result.success) {
      return applySecurityHeaders(Response.json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors
      }, {
        status: 400
      }));
    }
    const {
      token,
      password
    } = result.data;
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: {
        token
      },
      include: {
        user: true
      }
    });
    if (!resetRecord || resetRecord.usedAt !== null) {
      return applySecurityHeaders(Response.json({
        error: "This password reset link is invalid or has already been used."
      }, {
        status: 400
      }));
    }
    if (resetRecord.expiresAt < /* @__PURE__ */ new Date()) {
      return applySecurityHeaders(Response.json({
        error: "This password reset link has expired. Please request a new one."
      }, {
        status: 410
      }));
    }
    const newHash = await hashPassword(password);
    await prisma.$transaction([prisma.user.update({
      where: {
        id: resetRecord.userId
      },
      data: {
        passwordHash: newHash
      }
    }), prisma.passwordResetToken.update({
      where: {
        id: resetRecord.id
      },
      data: {
        usedAt: /* @__PURE__ */ new Date()
      }
    })]);
    return applySecurityHeaders(Response.json({
      success: true,
      message: "Your password has been successfully reset. You may now sign in."
    }));
  } catch (error) {
    console.error("[Reset Password Error]:", error);
    return applySecurityHeaders(Response.json({
      error: "Failed to reset password. Please try again."
    }, {
      status: 500
    }));
  }
}
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
async function action$1({
  request
}) {
  if (request.method !== "POST") {
    return Response.json({
      error: "Method not allowed"
    }, {
      status: 405
    });
  }
  try {
    const {
      token
    } = await request.json();
    if (!token || typeof token !== "string") {
      return Response.json({
        error: "Invalid or missing token"
      }, {
        status: 400
      });
    }
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: {
        token
      },
      include: {
        user: true
      }
    });
    if (!verificationRecord) {
      return Response.json({
        error: "Invalid or expired verification token."
      }, {
        status: 400
      });
    }
    if (verificationRecord.expiresAt < /* @__PURE__ */ new Date()) {
      await prisma.emailVerificationToken.delete({
        where: {
          id: verificationRecord.id
        }
      });
      return Response.json({
        error: "Verification token has expired. Please request a new one."
      }, {
        status: 410
      });
    }
    await prisma.user.update({
      where: {
        id: verificationRecord.userId
      },
      data: {
        isEmailVerified: true
      }
    });
    await prisma.emailVerificationToken.delete({
      where: {
        id: verificationRecord.id
      }
    });
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", verificationRecord.user.id);
    return Response.json({
      success: true,
      message: "Email verified successfully! Redirecting to your dashboard..."
    }, {
      status: 200,
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    });
  } catch (error) {
    console.error("[Verify Email Error]:", error);
    return Response.json({
      error: "Failed to verify email. Please try again."
    }, {
      status: 500
    });
  }
}
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader$1({
  request
}) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      database: "connected",
      service: "ClassMark Attendance API",
      emailService: process.env.RESEND_API_KEY ? "Resend API" : process.env.SMTP_HOST ? "SMTP" : "Simulated/None",
      emailSender: process.env.EMAIL_FROM || "ClassMark <noreply@classmarker.online>",
      appVersion: "1.0.2",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err?.message || "Database connection failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      status: 500
    });
  }
}
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function generateQrCodeDataUrl(url) {
  return QRCode.toDataURL(url, {
    width: 480,
    margin: 2,
    color: {
      dark: "#0F172A",
      // Deep charcoal/navy
      light: "#FFFFFF"
    },
    errorCorrectionLevel: "H"
  });
}
async function createAttendanceSession(params) {
  const token = crypto.randomBytes(24).toString("base64url");
  const startTime = /* @__PURE__ */ new Date();
  const expiresAt = new Date(startTime.getTime() + params.durationMinutes * 60 * 1e3);
  const sessionPin = params.sessionPin?.trim() || Math.floor(1e3 + Math.random() * 9e3).toString();
  const session = await prisma.attendanceSession.create({
    data: {
      courseId: params.courseId,
      topic: params.topic?.trim() || null,
      token,
      sessionPin,
      status: "OPEN",
      startTime,
      expiresAt,
      verificationMethod: params.verificationMethod,
      allowLateCheckin: params.allowLateCheckin ?? false
    },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          title: true,
          lecturerId: true
        }
      }
    }
  });
  return session;
}
async function closeAttendanceSession(sessionId, lecturerId) {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: { course: true }
  });
  if (!session || session.course.lecturerId !== lecturerId) {
    throw new Error("Session not found or unauthorized");
  }
  const updated = await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: {
      status: "CLOSED",
      endTime: /* @__PURE__ */ new Date()
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: lecturerId,
      courseId: session.courseId,
      sessionId: session.id,
      action: "SESSION_CLOSED",
      details: JSON.stringify({ closedAt: (/* @__PURE__ */ new Date()).toISOString() })
    }
  });
  return updated;
}
function normalizeHeaderKey(header) {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.includes("matric") || clean.includes("regno") || clean.includes("studentno") || clean.includes("idno") || clean === "id") {
    return "matricNumber";
  }
  if (clean.includes("name") || clean.includes("student")) {
    return "fullName";
  }
  if (clean.includes("email") || clean.includes("mail")) {
    return "email";
  }
  if (clean.includes("dept") || clean.includes("department")) {
    return "department";
  }
  if (clean.includes("fac") || clean.includes("faculty")) {
    return "faculty";
  }
  if (clean.includes("level") || clean.includes("year")) {
    return "level";
  }
  if (clean.includes("pin") || clean.includes("code")) {
    return "studentPin";
  }
  return clean;
}
function generateStudentPin() {
  return Math.floor(1e3 + Math.random() * 9e3).toString();
}
async function parseExcelBuffer(buffer, fileName) {
  try {
    const ext = fileName.toLowerCase().split(".").pop();
    if (ext === "xlsx" && (buffer.length < 4 || buffer[0] !== 80 || buffer[1] !== 75)) {
      return {
        success: false,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            reason: "Failed to read Excel workbook: The file is not a valid .xlsx spreadsheet (corrupted or misleading extension).",
            rawData: {}
          }
        ],
        detectedColumns: [],
        totalExtracted: 0,
        fileName
      };
    }
    const workbook = XLSX.read(buffer, { type: "buffer", raw: false, cellText: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        validRows: [],
        invalidRows: [{ rowNumber: 1, reason: "Workbook contains no worksheets", rawData: {} }],
        detectedColumns: [],
        totalExtracted: 0,
        fileName
      };
    }
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false
    });
    return processMatrixData(matrix, fileName);
  } catch (err) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to read Excel workbook: ${err.message || "Corrupted or invalid spreadsheet file"}`,
          rawData: {}
        }
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName
    };
  }
}
async function parseCsvBuffer(buffer, fileName) {
  try {
    const content = buffer.toString("utf-8");
    if (!content.trim()) {
      return {
        success: false,
        validRows: [],
        invalidRows: [{ rowNumber: 1, reason: "The uploaded CSV file is empty", rawData: {} }],
        detectedColumns: [],
        totalExtracted: 0,
        fileName
      };
    }
    const workbook = XLSX.read(content, { type: "string", raw: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        validRows: [],
        invalidRows: [{ rowNumber: 1, reason: "CSV contains no readable records", rawData: {} }],
        detectedColumns: [],
        totalExtracted: 0,
        fileName
      };
    }
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false
    });
    return processMatrixData(matrix, fileName);
  } catch (err) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to parse CSV file: ${err.message || "Corrupted or invalid CSV structure"}`,
          rawData: {}
        }
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName
    };
  }
}
async function parseDocxBuffer(buffer, fileName) {
  try {
    const { value: html } = await mammoth.convertToHtml({ buffer });
    const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/gi);
    if (!rowMatches || rowMatches.length === 0) {
      const { value: rawText } = await mammoth.extractRawText({ buffer });
      return parseTextLines(rawText, fileName);
    }
    const matrix = [];
    for (const rowHtml of rowMatches) {
      const cellMatches = rowHtml.match(/<t[dh][\s\S]*?<\/t[dh]>/gi);
      if (cellMatches) {
        const rowCells = cellMatches.map(
          (cell) => cell.replace(/<[^>]+>/g, "").trim()
        );
        if (rowCells.some((c) => c.length > 0)) {
          matrix.push(rowCells);
        }
      }
    }
    return processMatrixData(matrix, fileName);
  } catch (err) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to extract records from Word document: ${err.message || "Corrupted or invalid .docx file"}`,
          rawData: {}
        }
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName
    };
  }
}
async function parsePdfBuffer(buffer, fileName) {
  try {
    const pdfModule = await import("pdf-parse");
    let extractedText = "";
    if (pdfModule?.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const res = await parser.getText();
      extractedText = typeof res === "string" ? res : res?.text || "";
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
    } else if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      extractedText = data?.text || "";
    } else if (typeof pdfModule?.default === "function") {
      const data = await pdfModule.default(buffer);
      extractedText = data?.text || "";
    }
    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            reason: "This PDF contains scanned image pages without selectable text. Please provide an OCR-converted document or Excel roster.",
            rawData: {}
          }
        ],
        detectedColumns: [],
        totalExtracted: 0,
        fileName
      };
    }
    return parseTextLines(extractedText, fileName);
  } catch (err) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to extract text from PDF: ${err.message}`,
          rawData: {}
        }
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName
    };
  }
}
function parseTextLines(text, fileName) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const validRows = [];
  const invalidRows = [];
  const seenMatrics = /* @__PURE__ */ new Set();
  const matricRegex = /([A-Za-z0-9]{2,}\/[A-Za-z0-9\/_-]+|[A-Za-z]{2,}\d{4,}|\d{6,})/i;
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes("page ") || line.toLowerCase().includes("university") || line.toLowerCase().includes("department") && line.length < 50 && !line.includes(",")) {
      return;
    }
    const parts = line.split(/[,\t]+|\s{2,}/).map((p) => p.trim()).filter(Boolean);
    let matricNumber = "";
    let fullName = "";
    let email = "";
    const match = line.match(matricRegex);
    if (match) {
      matricNumber = match[0].trim().toUpperCase();
      fullName = line.replace(match[0], "").replace(/^[,\s\-\.]+|[,\s\-\.]+$/g, "").trim();
    } else if (parts.length >= 2) {
      if (parts[0].length >= 4 && /\d/.test(parts[0])) {
        matricNumber = parts[0];
        fullName = parts[1];
      } else if (parts[1].length >= 4 && /\d/.test(parts[1])) {
        matricNumber = parts[1];
        fullName = parts[0];
      }
    }
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0].toLowerCase();
      fullName = fullName.replace(emailMatch[0], "").trim();
    }
    if (!matricNumber || matricNumber.length < 3) {
      if (line.length > 5 && (line.includes("/") || /\d{4}/.test(line))) {
        invalidRows.push({
          rowNumber: idx + 1,
          reason: "Could not identify a valid matriculation number in this row.",
          rawData: { line }
        });
      }
      return;
    }
    matricNumber = matricNumber.toUpperCase();
    if (seenMatrics.has(matricNumber)) {
      invalidRows.push({
        rowNumber: idx + 1,
        reason: `Duplicate matriculation number "${matricNumber}" found in file.`,
        rawData: { line, matricNumber, fullName }
      });
      return;
    }
    seenMatrics.add(matricNumber);
    validRows.push({
      matricNumber,
      fullName: fullName || "Student " + matricNumber,
      email: email || void 0,
      studentPin: generateStudentPin()
    });
  });
  return {
    success: validRows.length > 0,
    validRows,
    invalidRows,
    detectedColumns: ["matricNumber", "fullName", "email"],
    totalExtracted: validRows.length,
    fileName
  };
}
function processMatrixData(matrix, fileName) {
  if (matrix.length === 0) {
    return {
      success: false,
      validRows: [],
      invalidRows: [{ rowNumber: 1, reason: "The uploaded file is empty", rawData: {} }],
      detectedColumns: [],
      totalExtracted: 0,
      fileName
    };
  }
  let headerIndex = -1;
  for (let r = 0; r < Math.min(matrix.length, 10); r++) {
    const row = matrix[r];
    const rowText = row.join(" ").toLowerCase();
    if ((rowText.includes("matric") || rowText.includes("reg") || rowText.includes("student no") || rowText.includes("id")) && (rowText.includes("name") || rowText.includes("student"))) {
      headerIndex = r;
      break;
    }
  }
  if (headerIndex === -1) {
    headerIndex = 0;
  }
  const rawHeaders = matrix[headerIndex].map((h) => String(h || "").trim());
  const columnMap = {};
  rawHeaders.forEach((header, colIdx) => {
    const key = normalizeHeaderKey(header);
    if (key && !(key in columnMap)) {
      columnMap[key] = colIdx;
    }
  });
  if (columnMap["matricNumber"] === void 0) {
    for (let c = 0; c < Math.min(rawHeaders.length, 4); c++) {
      const sample = matrix.slice(headerIndex + 1, headerIndex + 5).map((row) => row[c] || "");
      if (sample.some((val) => /\d/.test(val) && (val.includes("/") || val.length >= 5))) {
        columnMap["matricNumber"] = c;
        break;
      }
    }
  }
  if (columnMap["fullName"] === void 0) {
    for (let c = 0; c < Math.min(rawHeaders.length, 4); c++) {
      if (c !== columnMap["matricNumber"]) {
        columnMap["fullName"] = c;
        break;
      }
    }
  }
  const validRows = [];
  const invalidRows = [];
  const seenMatrics = /* @__PURE__ */ new Set();
  for (let r = headerIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.every((c) => String(c).trim() === "")) continue;
    const rowObj = {};
    rawHeaders.forEach((header, idx) => {
      rowObj[header || `col_${idx}`] = row[idx] || "";
    });
    const rawMatric = columnMap["matricNumber"] !== void 0 ? String(row[columnMap["matricNumber"]] || "").trim() : "";
    const rawName = columnMap["fullName"] !== void 0 ? String(row[columnMap["fullName"]] || "").trim() : "";
    const rawEmail = columnMap["email"] !== void 0 ? String(row[columnMap["email"]] || "").trim().toLowerCase() : "";
    const rawDept = columnMap["department"] !== void 0 ? String(row[columnMap["department"]] || "").trim() : "";
    const rawFaculty = columnMap["faculty"] !== void 0 ? String(row[columnMap["faculty"]] || "").trim() : "";
    const rawLevel = columnMap["level"] !== void 0 ? String(row[columnMap["level"]] || "").trim() : "";
    const rawPin = columnMap["studentPin"] !== void 0 ? String(row[columnMap["studentPin"]] || "").trim() : "";
    if (!rawMatric || rawMatric.length < 2) {
      invalidRows.push({
        rowNumber: r + 1,
        reason: "Missing or blank matriculation number.",
        rawData: rowObj
      });
      continue;
    }
    const matricNumber = rawMatric.toUpperCase();
    if (seenMatrics.has(matricNumber)) {
      invalidRows.push({
        rowNumber: r + 1,
        reason: `Duplicate matriculation number "${matricNumber}" within the uploaded list.`,
        rawData: rowObj
      });
      continue;
    }
    seenMatrics.add(matricNumber);
    validRows.push({
      matricNumber,
      fullName: rawName || `Student ${matricNumber}`,
      email: rawEmail || void 0,
      department: rawDept || void 0,
      faculty: rawFaculty || void 0,
      level: rawLevel || void 0,
      studentPin: rawPin || generateStudentPin()
    });
  }
  if (validRows.length === 0 && invalidRows.length === 0) {
    invalidRows.push({
      rowNumber: 1,
      reason: "No student records could be identified. Please ensure the file contains columns for Matriculation Number and Full Name.",
      rawData: {}
    });
  }
  return {
    success: validRows.length > 0,
    validRows,
    invalidRows,
    detectedColumns: Object.keys(columnMap),
    totalExtracted: validRows.length,
    fileName
  };
}
async function parseClassListFile(buffer, fileName) {
  const ext = fileName.toLowerCase().split(".").pop();
  switch (ext) {
    case "xlsx":
    case "xls":
      return parseExcelBuffer(buffer, fileName);
    case "csv":
      return parseCsvBuffer(buffer, fileName);
    case "docx":
    case "doc":
      return parseDocxBuffer(buffer, fileName);
    case "pdf":
      return parsePdfBuffer(buffer, fileName);
    default:
      return {
        success: false,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            reason: `Unsupported file format ".${ext}". Please upload an Excel (.xlsx, .xls), CSV (.csv), Word (.docx), or PDF (.pdf) file.`,
            rawData: {}
          }
        ],
        detectedColumns: [],
        totalExtracted: 0,
        fileName
      };
  }
}
function sanitizeForExcel(val) {
  if (val === null || val === void 0) return "";
  const str = String(val).trim();
  if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
    return `'${str}`;
  }
  return str;
}
async function generateCourseExcelReport(data) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ClassMark Academic Attendance System";
  workbook.created = /* @__PURE__ */ new Date();
  const summarySheet = workbook.addWorksheet("Attendance Summary", {
    views: [{ state: "frozen", ySplit: 8 }]
  });
  summarySheet.mergeCells("A1:G1");
  const titleCell = summarySheet.getCell("A1");
  titleCell.value = `${data.course.code}: ${data.course.title}`;
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle" };
  summarySheet.mergeCells("A2:G2");
  const metaCell = summarySheet.getCell("A2");
  metaCell.value = `Academic Session: ${data.course.session} | ${data.course.semester} | Department: ${data.course.department || "N/A"}`;
  metaCell.font = { name: "Calibri", size: 11, italic: true, color: { argb: "FF475569" } };
  summarySheet.mergeCells("A3:G3");
  const lecturerCell = summarySheet.getCell("A3");
  lecturerCell.value = `Lecturer: ${data.course.lecturerName} (${data.course.lecturerInstitution || "Academic Staff"}) | Report Generated: ${formatDate(/* @__PURE__ */ new Date())}`;
  lecturerCell.font = { name: "Calibri", size: 10, color: { argb: "FF64748B" } };
  summarySheet.getCell("A5").value = "Total Enrolled Students:";
  summarySheet.getCell("B5").value = data.totalStudents;
  summarySheet.getCell("A5").font = { bold: true };
  summarySheet.getCell("C5").value = "Completed Lectures:";
  summarySheet.getCell("D5").value = data.totalSessions;
  summarySheet.getCell("C5").font = { bold: true };
  summarySheet.getCell("E5").value = "Overall Attendance:";
  summarySheet.getCell("F5").value = `${data.overallAttendanceRate}%`;
  summarySheet.getCell("E5").font = { bold: true };
  summarySheet.getCell("A6").value = "Required Threshold:";
  summarySheet.getCell("B6").value = `${data.course.attendanceThreshold}%`;
  summarySheet.getCell("A6").font = { bold: true };
  summarySheet.getCell("C6").value = "Below Threshold Alert:";
  summarySheet.getCell("D6").value = data.studentsBelowThresholdCount;
  summarySheet.getCell("C6").font = { bold: true, color: { argb: "FFDC2626" } };
  const headerRow = summarySheet.getRow(8);
  headerRow.values = [
    "S/N",
    "Matriculation Number",
    "Student Full Name",
    "Eligible Classes",
    "Classes Attended",
    "Classes Absent",
    "Excused",
    "Attendance (%)",
    "Classification",
    "Exam Eligibility"
  ];
  headerRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0369A1" }
    // ClassMark Academic Navy
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  summarySheet.getCell("C8").alignment = { vertical: "middle", horizontal: "left" };
  data.studentSummaries.forEach((s, idx) => {
    const row = summarySheet.addRow([
      idx + 1,
      sanitizeForExcel(s.matricNumber),
      sanitizeForExcel(s.fullName),
      s.eligibleSessions,
      s.attendedSessions,
      s.absentSessions,
      s.excusedSessions,
      s.attendancePercentage !== null ? `${s.attendancePercentage}%` : "N/A",
      s.classification,
      s.isBelowThreshold ? "DEFICIENT (Below Threshold)" : "QUALIFIED"
    ]);
    row.getCell(2).numFmt = "@";
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "left" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "center" };
    row.getCell(7).alignment = { horizontal: "center" };
    row.getCell(8).alignment = { horizontal: "center" };
    row.getCell(9).alignment = { horizontal: "center" };
    row.getCell(10).alignment = { horizontal: "center" };
    if (s.isBelowThreshold) {
      row.getCell(10).font = { bold: true, color: { argb: "FFDC2626" } };
    } else {
      row.getCell(10).font = { bold: true, color: { argb: "FF059669" } };
    }
  });
  summarySheet.columns = [
    { width: 6 },
    // S/N
    { width: 22 },
    // Matric
    { width: 32 },
    // Name
    { width: 15 },
    // Eligible
    { width: 16 },
    // Attended
    { width: 15 },
    // Absent
    { width: 12 },
    // Excused
    { width: 16 },
    // Percentage
    { width: 16 },
    // Classification
    { width: 28 }
    // Eligibility
  ];
  const matrixSheet = workbook.addWorksheet("Attendance Matrix", {
    views: [{ state: "frozen", ySplit: 2, xSplit: 3 }]
  });
  const matrixHeaders = [
    "S/N",
    "Matriculation Number",
    "Student Name",
    ...data.sessions.map((sess, idx) => `Lecture ${idx + 1} (${formatDate(sess.sessionDate)})`)
  ];
  const mHeaderRow = matrixSheet.getRow(2);
  mHeaderRow.values = matrixHeaders;
  mHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  mHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }
  };
  mHeaderRow.alignment = { horizontal: "center" };
  matrixSheet.getCell("C2").alignment = { horizontal: "left" };
  data.studentSummaries.forEach((s, idx) => {
    const sessionMarks = data.sessions.map((sess) => {
      const status = s.sessionRecordMap[sess.id];
      if (status === "PRESENT") return "P";
      if (status === "LATE") return "L";
      if (status === "EXCUSED") return "E";
      return "A";
    });
    const row = matrixSheet.addRow([
      idx + 1,
      sanitizeForExcel(s.matricNumber),
      sanitizeForExcel(s.fullName),
      ...sessionMarks
    ]);
    row.getCell(2).numFmt = "@";
    row.getCell(1).alignment = { horizontal: "center" };
    for (let c = 4; c <= matrixHeaders.length; c++) {
      const cell = row.getCell(c);
      cell.alignment = { horizontal: "center" };
      const val = cell.value;
      if (val === "P" || val === "L") {
        cell.font = { color: { argb: "FF059669" }, bold: true };
      } else if (val === "E") {
        cell.font = { color: { argb: "FFD97706" }, bold: true };
      } else {
        cell.font = { color: { argb: "FFDC2626" } };
      }
    }
  });
  matrixSheet.columns = [
    { width: 6 },
    { width: 22 },
    { width: 30 },
    ...data.sessions.map(() => ({ width: 16 }))
  ];
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
async function generateCoursePdfReport(data) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("CLASSMARK ACADEMIC ATTENDANCE REPORT", pageWidth / 2, 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("OFFICIAL UNIVERSITY COURSE ATTENDANCE REGISTER", pageWidth / 2, 24, { align: "center" });
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Course: ${data.course.code} - ${data.course.title}`, 14, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Academic Session: ${data.course.session} | Semester: ${data.course.semester}`, 14, 40);
  doc.text(`Department: ${data.course.department || "General"} | Faculty: ${data.course.faculty || "N/A"}`, 14, 45);
  doc.text(`Lecturer: ${data.course.lecturerName} (${data.course.lecturerInstitution || "Academic Staff"})`, 14, 50);
  doc.text(`Report Generation Date: ${formatDate(/* @__PURE__ */ new Date())}`, 14, 55);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 59, pageWidth - 28, 18, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const colWidth = (pageWidth - 28) / 4;
  doc.text("Total Enrolled:", 18, 66);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.totalStudents} students`, 18, 72);
  doc.setFont("helvetica", "bold");
  doc.text("Completed Lectures:", 18 + colWidth, 66);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.totalSessions} sessions`, 18 + colWidth, 72);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Attendance:", 18 + colWidth * 2, 66);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.overallAttendanceRate}%`, 18 + colWidth * 2, 72);
  doc.setFont("helvetica", "bold");
  doc.text("Threshold Alert:", 18 + colWidth * 3, 66);
  doc.setTextColor(220, 38, 38);
  doc.text(`${data.studentsBelowThresholdCount} below ${data.course.attendanceThreshold}%`, 18 + colWidth * 3, 72);
  const tableData = data.studentSummaries.map((s, idx) => [
    idx + 1,
    s.matricNumber,
    s.fullName,
    s.eligibleSessions,
    s.attendedSessions,
    s.absentSessions,
    s.attendancePercentage !== null ? `${s.attendancePercentage}%` : "N/A",
    s.isBelowThreshold ? "DEFICIENT" : "QUALIFIED"
  ]);
  autoTable(doc, {
    startY: 82,
    head: [
      [
        "S/N",
        "Matriculation No.",
        "Student Name",
        "Eligible",
        "Present",
        "Absent",
        "Rate (%)",
        "Eligibility"
      ]
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [3, 105, 161],
      // ClassMark navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 32, fontStyle: "bold" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 24, halign: "center", fontStyle: "bold" }
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 7) {
        if (hookData.cell.raw === "DEFICIENT") {
          hookData.cell.styles.textColor = [220, 38, 38];
        } else {
          hookData.cell.styles.textColor = [5, 150, 105];
        }
      }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (hookData) => {
      const pageNumber = hookData.pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `ClassMark Academic Records • Page ${pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
  });
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
const courseSchema = z.object({
  code: z.string().min(2, "Course code is required").max(30),
  title: z.string().min(3, "Course title is required").max(200),
  department: z.string().max(100).optional(),
  faculty: z.string().max(100).optional(),
  session: z.string().min(4, "Academic session is required").max(30),
  semester: z.string().min(2, "Semester is required").max(50),
  classGroup: z.string().max(50).optional(),
  description: z.string().max(1e3).optional(),
  expectedSessions: z.number().int().positive().optional().nullable(),
  attendanceThreshold: z.number().min(1).max(100).default(60)
});
const courseUpdateSchema = z.object({
  code: z.string().min(2, "Course code is required").max(30).optional(),
  title: z.string().min(3, "Course title is required").max(200).optional(),
  department: z.string().max(100).optional().nullable(),
  faculty: z.string().max(100).optional().nullable(),
  session: z.string().min(4, "Academic session is required").max(30).optional(),
  semester: z.string().min(2, "Semester is required").max(50).optional(),
  classGroup: z.string().max(50).optional().nullable(),
  description: z.string().max(1e3).optional().nullable(),
  expectedSessions: z.number().int().positive().optional().nullable(),
  attendanceThreshold: z.number().min(1).max(100).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional()
});
const studentActionSchema = z.discriminatedUnion("action", [z.object({
  action: z.literal("add"),
  matricNumber: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  department: z.string().optional(),
  level: z.string().optional(),
  studentPin: z.string().optional()
}), z.object({
  action: z.literal("update"),
  studentId: z.string(),
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  department: z.string().optional(),
  level: z.string().optional(),
  studentPin: z.string().optional()
}), z.object({
  action: z.literal("withdraw"),
  studentId: z.string(),
  reason: z.string().optional()
}), z.object({
  action: z.literal("re-enroll"),
  studentId: z.string()
})]);
const sessionSchema = z.object({
  topic: z.string().max(200).optional(),
  durationMinutes: z.number().int().min(5).max(300).default(30),
  sessionPin: z.string().max(10).optional(),
  verificationMethod: z.enum(["EMAIL_OTP", "STUDENT_PIN", "OPEN_CHECKIN"]).default("STUDENT_PIN"),
  allowLateCheckin: z.boolean().default(false)
});
const overrideSchema = z.object({
  enrolmentId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED", "LATE"]),
  reason: z.string().min(3, "A valid reason for manual attendance correction is mandatory")
});
const commitSchema = z.object({
  students: z.array(z.object({
    matricNumber: z.string().min(2),
    fullName: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    department: z.string().optional(),
    faculty: z.string().optional(),
    level: z.string().optional(),
    studentPin: z.string().optional()
  })),
  actionOnExisting: z.enum(["retain", "update"]).default("update")
});
const requestOtpSchema = z.object({
  matricNumber: z.string().min(2)
});
const checkInSchema = z.object({
  matricNumber: z.string().min(2, "Matriculation number is required"),
  sessionPin: z.string().optional(),
  studentPin: z.string().optional(),
  otpCode: z.string().optional(),
  deviceId: z.string().optional()
});
const settingsSchema = z.object({
  fullName: z.string().min(2).max(100),
  institution: z.string().max(150).optional(),
  department: z.string().max(100).optional(),
  timeZone: z.string().default("Africa/Lagos"),
  defaultThreshold: z.number().min(1).max(100).default(60),
  defaultSessionDuration: z.number().int().min(5).max(300).default(30),
  defaultVerificationMethod: z.enum(["STUDENT_PIN", "EMAIL_OTP", "OPEN_CHECKIN"]).default("STUDENT_PIN"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional().or(z.literal(""))
});
async function loader({
  request,
  params
}) {
  const path2 = (params["*"] || "").replace(/^\/+|\/+$/g, "");
  const parts = path2.split("/");
  if (parts.length === 1 && parts[0] === "health") {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return Response.json({
        status: "ok",
        database: "connected",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      return Response.json({
        status: "error",
        message: err?.message || "Database connection error"
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 1 && parts[0] === "courses") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courses2 = await prisma.course.findMany({
      where: {
        lecturerId: user.id
      },
      orderBy: {
        updatedAt: "desc"
      },
      include: {
        _count: {
          select: {
            enrolments: {
              where: {
                status: "ACTIVE"
              }
            },
            attendanceSessions: true
          }
        }
      }
    });
    return Response.json({
      courses: courses2
    });
  }
  if (parts.length === 2 && parts[0] === "courses") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      },
      include: {
        _count: {
          select: {
            enrolments: {
              where: {
                status: "ACTIVE"
              }
            },
            attendanceSessions: true
          }
        }
      }
    });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({
        error: "Course not found or unauthorized"
      }, {
        status: 404
      });
    }
    return Response.json({
      course
    });
  }
  if (parts.length === 3 && parts[0] === "courses" && parts[1] === "template" && parts[2] === "excel") {
    const wb = XLSX.utils.book_new();
    const headers = [["Matriculation Number", "Full Name", "Institutional Email", "Department", "Level"], ["CSC/2024/001", "Surname Firstname", "student@university.edu.ng", "Computer Science", "200"]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    ws["!cols"] = [{
      wch: 25
    }, {
      wch: 30
    }, {
      wch: 35
    }, {
      wch: 25
    }, {
      wch: 10
    }];
    XLSX.utils.book_append_sheet(wb, ws, "Class List Template");
    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx"
    });
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="ClassMark_Class_List_Template.xlsx"'
      }
    });
  }
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "sessions") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    const sessionId = parts[3];
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      }
    });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 404
      });
    }
    const session = await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId
      },
      include: {
        records: {
          include: {
            enrolment: {
              include: {
                student: true
              }
            }
          },
          orderBy: {
            checkInTime: "desc"
          }
        }
      }
    });
    if (!session || session.courseId !== course.id) {
      return Response.json({
        error: "Session not found."
      }, {
        status: 404
      });
    }
    const activeEnrolments = await prisma.courseEnrolment.findMany({
      where: {
        courseId: course.id,
        status: "ACTIVE"
      },
      include: {
        student: true
      },
      orderBy: {
        student: {
          matricNumber: "asc"
        }
      }
    });
    const url = new URL(request.url);
    const appUrl2 = `${url.protocol}//${url.host}`;
    const qrTargetUrl = session.sessionPin ? `${appUrl2}/attendance/${session.token}?pin=${encodeURIComponent(session.sessionPin)}` : `${appUrl2}/attendance/${session.token}`;
    const checkInUrl = `${appUrl2}/attendance/${session.token}`;
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrTargetUrl);
    return Response.json({
      success: true,
      session,
      checkInUrl,
      qrTargetUrl,
      qrCodeDataUrl,
      totalEnrolled: activeEnrolments.length,
      presentCount: session.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
      enrolledStudents: activeEnrolments.map((e) => ({
        enrolmentId: e.id,
        studentId: e.student.id,
        matricNumber: e.student.matricNumber,
        fullName: e.student.fullName,
        email: e.student.email
      }))
    });
  }
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "reports") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    try {
      const reportData = await calculateCourseAttendance(courseId, user.id);
      return Response.json({
        success: true,
        report: reportData
      });
    } catch (err) {
      const status = err.message?.includes("unauthorized") || err.message?.includes("not found") ? 404 : 500;
      return Response.json({
        error: err.message || "Failed to calculate course attendance records."
      }, {
        status
      });
    }
  }
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "reports" && parts[3] === "excel") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    try {
      const reportData = await calculateCourseAttendance(courseId, user.id);
      const buffer = await generateCourseExcelReport(reportData);
      const safeCourseCode = reportData.course.code.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSession = reportData.course.session.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSemester = reportData.course.semester.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${safeCourseCode}_${safeSession}_${safeSemester}_Attendance.xlsx`;
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0"
        }
      });
    } catch (err) {
      const status = err.message?.includes("unauthorized") || err.message?.includes("not found") ? 404 : 500;
      return Response.json({
        error: err.message || "Failed to generate Excel attendance report."
      }, {
        status
      });
    }
  }
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "reports" && parts[3] === "pdf") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    try {
      const reportData = await calculateCourseAttendance(courseId, user.id);
      const buffer = await generateCoursePdfReport(reportData);
      const safeCourseCode = reportData.course.code.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSession = reportData.course.session.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSemester = reportData.course.semester.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${safeCourseCode}_${safeSession}_${safeSemester}_Report.pdf`;
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0"
        }
      });
    } catch (err) {
      const status = err.message?.includes("unauthorized") || err.message?.includes("not found") ? 404 : 500;
      return Response.json({
        error: err.message || "Failed to generate PDF attendance report."
      }, {
        status
      });
    }
  }
  if (parts.length === 2 && parts[0] === "attendance") {
    const token = parts[1];
    const session = await prisma.attendanceSession.findUnique({
      where: {
        token
      },
      include: {
        course: {
          select: {
            code: true,
            title: true,
            session: true,
            semester: true,
            lecturer: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });
    if (!session) {
      return Response.json({
        error: "Attendance session not found or link is invalid."
      }, {
        status: 404
      });
    }
    const isExpired = session.expiresAt < /* @__PURE__ */ new Date();
    const isClosed = session.status === "CLOSED" || session.status === "CANCELLED" || isExpired;
    return Response.json({
      success: true,
      courseCode: session.course.code,
      courseTitle: session.course.title,
      lecturerName: session.course.lecturer?.fullName || "Course Lecturer",
      academicSession: session.course.session,
      semester: session.course.semester,
      topic: session.topic || "Lecture Attendance",
      status: isClosed ? "CLOSED" : "OPEN",
      verificationMethod: session.verificationMethod,
      requiresInClassPin: !!session.sessionPin,
      expiresAt: session.expiresAt
    });
  }
  if (parts.length === 3 && parts[0] === "attendance" && parts[2] === "lookup") {
    const token = parts[1];
    const url = new URL(request.url);
    const matric = url.searchParams.get("matric");
    if (!matric || matric.trim().length < 2) {
      return Response.json({
        error: "Matriculation number is required"
      }, {
        status: 400
      });
    }
    const cleanMatric = matric.trim().toUpperCase().replace(/\\/g, "/");
    const session = await prisma.attendanceSession.findUnique({
      where: {
        token
      },
      select: {
        id: true,
        courseId: true,
        status: true,
        expiresAt: true,
        sessionPin: true,
        verificationMethod: true
      }
    });
    if (!session) {
      return Response.json({
        error: "Session not found"
      }, {
        status: 404
      });
    }
    const isClosed = session.status === "CLOSED" || session.expiresAt < /* @__PURE__ */ new Date();
    let student = await prisma.student.findUnique({
      where: {
        matricNumber: cleanMatric
      },
      include: {
        enrolments: {
          where: {
            courseId: session.courseId,
            status: "ACTIVE"
          },
          include: {
            records: {
              where: {
                sessionId: session.id
              }
            }
          }
        }
      }
    });
    if (!student || student.enrolments.length === 0) {
      student = await prisma.student.findFirst({
        where: {
          matricNumber: {
            equals: cleanMatric,
            mode: "insensitive"
          }
        },
        include: {
          enrolments: {
            where: {
              courseId: session.courseId,
              status: "ACTIVE"
            },
            include: {
              records: {
                where: {
                  sessionId: session.id
                }
              }
            }
          }
        }
      });
    }
    if (!student || student.enrolments.length === 0) {
      return Response.json({
        found: false,
        matricNumber: cleanMatric,
        message: "Not enrolled in this course"
      });
    }
    const enrolment = student.enrolments[0];
    const existingRecord = enrolment.records[0];
    const alreadyRecorded = !!existingRecord;
    return Response.json({
      found: true,
      student: {
        id: student.id,
        fullName: student.fullName,
        matricNumber: student.matricNumber,
        department: student.department,
        hasStudentPin: !!student.studentPin,
        devStudentPin: process.env.NODE_ENV === "development" ? student.studentPin : void 0
      },
      alreadyRecorded,
      checkInTime: alreadyRecorded ? existingRecord.checkInTime : null,
      formattedCheckInTime: alreadyRecorded ? formatDateTime(existingRecord.checkInTime) : null,
      sessionStatus: isClosed ? "CLOSED" : "OPEN"
    });
  }
  return Response.json({
    error: "Not Found"
  }, {
    status: 404
  });
}
async function action({
  request,
  params
}) {
  const path2 = (params["*"] || "").replace(/^\/+|\/+$/g, "");
  const parts = path2.split("/");
  if (parts.length === 1 && parts[0] === "courses") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    try {
      const body = await request.json();
      const result = courseSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Validation failed",
          details: result.error.flatten().fieldErrors
        }, {
          status: 400
        });
      }
      const data = result.data;
      const normalizedCode = data.code.trim().toUpperCase();
      const existing = await prisma.course.findUnique({
        where: {
          lecturerId_code_session_semester: {
            lecturerId: user.id,
            code: normalizedCode,
            session: data.session.trim(),
            semester: data.semester.trim()
          }
        }
      });
      if (existing) {
        return Response.json({
          error: `A course with code ${normalizedCode} already exists for academic session ${data.session} (${data.semester}).`
        }, {
          status: 409
        });
      }
      const course = await prisma.course.create({
        data: {
          lecturerId: user.id,
          code: normalizedCode,
          title: data.title.trim(),
          department: data.department?.trim() || user.department || null,
          faculty: data.faculty?.trim() || null,
          session: data.session.trim(),
          semester: data.semester.trim(),
          classGroup: data.classGroup?.trim() || null,
          description: data.description?.trim() || null,
          expectedSessions: data.expectedSessions || null,
          attendanceThreshold: data.attendanceThreshold,
          status: "ACTIVE"
        }
      });
      return Response.json({
        success: true,
        course
      }, {
        status: 201
      });
    } catch (err) {
      console.error("[Create Course Error]:", err);
      return Response.json({
        error: "Failed to create course."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 2 && parts[0] === "courses" || parts.length === 3 && parts[0] === "courses" && parts[2] === "delete") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      }
    });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({
        error: "Course not found or access denied."
      }, {
        status: 404
      });
    }
    const isExplicitDeleteRoute = parts.length === 3 && parts[2] === "delete";
    let isDeleteAction = request.method === "DELETE" || isExplicitDeleteRoute;
    let body = {};
    if (request.method !== "GET") {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }
    if (body.action === "delete" || body._method === "DELETE") {
      isDeleteAction = true;
    }
    if (isDeleteAction) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "COURSE_DELETED",
            details: JSON.stringify({
              courseId: course.id,
              code: course.code,
              title: course.title,
              session: course.session,
              semester: course.semester
            })
          }
        });
        await prisma.course.delete({
          where: {
            id: courseId
          }
        });
        return Response.json({
          success: true,
          message: `Course ${course.code} has been successfully deleted.`
        });
      } catch (err) {
        console.error("[Delete Course Error]:", err);
        return Response.json({
          error: "Failed to delete course."
        }, {
          status: 500
        });
      }
    }
    try {
      const result = courseUpdateSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Validation failed",
          details: result.error.flatten().fieldErrors
        }, {
          status: 400
        });
      }
      const data = result.data;
      const targetCode = data.code !== void 0 ? data.code.trim().toUpperCase() : course.code;
      const targetSession = data.session !== void 0 ? data.session.trim() : course.session;
      const targetSemester = data.semester !== void 0 ? data.semester.trim() : course.semester;
      if (targetCode !== course.code || targetSession !== course.session || targetSemester !== course.semester) {
        const duplicate = await prisma.course.findUnique({
          where: {
            lecturerId_code_session_semester: {
              lecturerId: user.id,
              code: targetCode,
              session: targetSession,
              semester: targetSemester
            }
          }
        });
        if (duplicate && duplicate.id !== course.id) {
          return Response.json({
            error: `A course with code ${targetCode} already exists for academic session ${targetSession} (${targetSemester}).`
          }, {
            status: 409
          });
        }
      }
      const updateData = {};
      if (data.code !== void 0) updateData.code = targetCode;
      if (data.title !== void 0) updateData.title = data.title.trim();
      if (data.department !== void 0) updateData.department = data.department?.trim() || null;
      if (data.faculty !== void 0) updateData.faculty = data.faculty?.trim() || null;
      if (data.session !== void 0) updateData.session = targetSession;
      if (data.semester !== void 0) updateData.semester = targetSemester;
      if (data.classGroup !== void 0) updateData.classGroup = data.classGroup?.trim() || null;
      if (data.description !== void 0) updateData.description = data.description?.trim() || null;
      if (data.expectedSessions !== void 0) updateData.expectedSessions = data.expectedSessions;
      if (data.attendanceThreshold !== void 0) updateData.attendanceThreshold = data.attendanceThreshold;
      if (data.status !== void 0) updateData.status = data.status;
      const updatedCourse = await prisma.course.update({
        where: {
          id: courseId
        },
        data: updateData
      });
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "COURSE_UPDATED",
          details: JSON.stringify({
            changes: updateData
          })
        }
      });
      return Response.json({
        success: true,
        course: updatedCourse,
        message: `Course ${updatedCourse.code} updated successfully.`
      });
    } catch (err) {
      console.error("[Update Course Error]:", err);
      return Response.json({
        error: "Failed to update course."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "students") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      }
    });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({
        error: "Course not found or access denied."
      }, {
        status: 404
      });
    }
    try {
      const body = await request.json();
      const result = studentActionSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Validation failed",
          details: result.error.flatten()
        }, {
          status: 400
        });
      }
      const data = result.data;
      if (data.action === "add") {
        const cleanMatric = data.matricNumber.trim().toUpperCase();
        const cleanName = data.fullName.trim();
        const cleanEmail = data.email ? data.email.trim().toLowerCase() : null;
        const student = await prisma.student.upsert({
          where: {
            matricNumber: cleanMatric
          },
          create: {
            matricNumber: cleanMatric,
            fullName: cleanName,
            email: cleanEmail,
            department: data.department?.trim() || null,
            level: data.level?.trim() || null,
            studentPin: data.studentPin?.trim() || generateStudentPin()
          },
          update: {
            fullName: cleanName,
            email: cleanEmail || void 0,
            department: data.department?.trim() || void 0,
            level: data.level?.trim() || void 0
          }
        });
        await prisma.courseEnrolment.upsert({
          where: {
            courseId_studentId: {
              courseId: course.id,
              studentId: student.id
            }
          },
          create: {
            courseId: course.id,
            studentId: student.id,
            status: "ACTIVE"
          },
          update: {
            status: "ACTIVE"
          }
        });
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            courseId: course.id,
            action: "STUDENT_ADDED_MANUALLY",
            details: JSON.stringify({
              matricNumber: cleanMatric,
              fullName: cleanName
            })
          }
        });
        return Response.json({
          success: true,
          student
        });
      }
      if (data.action === "update") {
        const student = await prisma.student.update({
          where: {
            id: data.studentId
          },
          data: {
            fullName: data.fullName.trim(),
            email: data.email ? data.email.trim().toLowerCase() : null,
            department: data.department?.trim() || null,
            level: data.level?.trim() || null,
            studentPin: data.studentPin?.trim() || void 0
          }
        });
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            courseId: course.id,
            action: "STUDENT_UPDATED",
            details: JSON.stringify({
              studentId: student.id,
              matricNumber: student.matricNumber
            })
          }
        });
        return Response.json({
          success: true,
          student
        });
      }
      if (data.action === "withdraw") {
        await prisma.courseEnrolment.update({
          where: {
            courseId_studentId: {
              courseId: course.id,
              studentId: data.studentId
            }
          },
          data: {
            status: "WITHDRAWN",
            withdrawnAt: /* @__PURE__ */ new Date()
          }
        });
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            courseId: course.id,
            action: "STUDENT_WITHDRAWN",
            details: JSON.stringify({
              studentId: data.studentId,
              reason: data.reason
            })
          }
        });
        return Response.json({
          success: true,
          message: "Student withdrawn from course."
        });
      }
      if (data.action === "re-enroll") {
        await prisma.courseEnrolment.update({
          where: {
            courseId_studentId: {
              courseId: course.id,
              studentId: data.studentId
            }
          },
          data: {
            status: "ACTIVE",
            withdrawnAt: null
          }
        });
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            courseId: course.id,
            action: "STUDENT_REENROLLED",
            details: JSON.stringify({
              studentId: data.studentId
            })
          }
        });
        return Response.json({
          success: true,
          message: "Student re-enrolled in course."
        });
      }
      return Response.json({
        error: "Invalid action."
      }, {
        status: 400
      });
    } catch (err) {
      console.error("[Student Action Error]:", err);
      return Response.json({
        error: "Failed to process student action."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "sessions") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      }
    });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({
        error: "Course not found or access denied."
      }, {
        status: 404
      });
    }
    try {
      const body = await request.json();
      const result = sessionSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Validation failed",
          details: result.error.flatten()
        }, {
          status: 400
        });
      }
      const session = await createAttendanceSession({
        courseId: course.id,
        topic: result.data.topic,
        durationMinutes: result.data.durationMinutes,
        sessionPin: result.data.sessionPin,
        verificationMethod: result.data.verificationMethod,
        allowLateCheckin: result.data.allowLateCheckin
      });
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          sessionId: session.id,
          action: "SESSION_STARTED",
          details: JSON.stringify({
            topic: session.topic,
            durationMinutes: result.data.durationMinutes,
            verificationMethod: session.verificationMethod
          })
        }
      });
      return Response.json({
        success: true,
        session
      }, {
        status: 201
      });
    } catch (err) {
      console.error("[Create Session Error]:", err);
      return Response.json({
        error: "Failed to initiate attendance session."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 5 && parts[0] === "courses" && parts[2] === "sessions" && parts[4] === "close") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const sessionId = parts[3];
    try {
      const closed = await closeAttendanceSession(sessionId, user.id);
      return Response.json({
        success: true,
        message: "Attendance session closed successfully.",
        session: closed
      });
    } catch (err) {
      console.error("[Close Session Error]:", err);
      return Response.json({
        error: err.message || "Failed to close attendance session."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 5 && parts[0] === "courses" && parts[2] === "sessions" && parts[4] === "extend") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const sessionId = parts[3];
    try {
      const body = await request.json();
      const additionalMinutes = parseInt(body.minutes || "10", 10);
      const session = await prisma.attendanceSession.findUnique({
        where: {
          id: sessionId
        },
        include: {
          course: true
        }
      });
      if (!session || session.course.lecturerId !== user.id) {
        return Response.json({
          error: "Session not found or unauthorized."
        }, {
          status: 404
        });
      }
      const currentExpiry = new Date(session.expiresAt).getTime();
      const newExpiry = new Date(Math.max(currentExpiry, Date.now()) + additionalMinutes * 60 * 1e3);
      const updated = await prisma.attendanceSession.update({
        where: {
          id: sessionId
        },
        data: {
          expiresAt: newExpiry,
          status: "OPEN"
        }
      });
      return Response.json({
        success: true,
        message: `Session extended by ${additionalMinutes} minutes.`,
        expiresAt: updated.expiresAt
      });
    } catch (err) {
      console.error("[Extend Session Error]:", err);
      return Response.json({
        error: "Failed to extend session."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 5 && parts[0] === "courses" && parts[2] === "sessions" && parts[4] === "override") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    parts[1];
    const sessionId = parts[3];
    try {
      const body = await request.json();
      const result = overrideSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Validation failed",
          details: result.error.flatten()
        }, {
          status: 400
        });
      }
      const {
        enrolmentId,
        status,
        reason
      } = result.data;
      const session = await prisma.attendanceSession.findUnique({
        where: {
          id: sessionId
        },
        include: {
          course: true
        }
      });
      if (!session || session.course.lecturerId !== user.id) {
        return Response.json({
          error: "Session not found or access denied."
        }, {
          status: 404
        });
      }
      const enrolment = await prisma.courseEnrolment.findUnique({
        where: {
          id: enrolmentId
        },
        include: {
          student: true
        }
      });
      if (!enrolment || enrolment.courseId !== session.courseId) {
        return Response.json({
          error: "Enrolment record not found."
        }, {
          status: 404
        });
      }
      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          sessionId_enrolmentId: {
            sessionId: session.id,
            enrolmentId: enrolment.id
          }
        }
      });
      const previousStatus = existingRecord ? existingRecord.status : "NONE";
      const record = await prisma.attendanceRecord.upsert({
        where: {
          sessionId_enrolmentId: {
            sessionId: session.id,
            enrolmentId: enrolment.id
          }
        },
        create: {
          sessionId: session.id,
          enrolmentId: enrolment.id,
          status,
          verificationMethod: session.verificationMethod,
          verificationStatus: "MANUAL_OVERRIDE",
          checkInTime: /* @__PURE__ */ new Date(),
          isManualOverride: true,
          overrideReason: reason.trim(),
          overrideByLecturerId: user.id
        },
        update: {
          status,
          verificationStatus: "MANUAL_OVERRIDE",
          isManualOverride: true,
          overrideReason: reason.trim(),
          overrideByLecturerId: user.id
        }
      });
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: session.courseId,
          sessionId: session.id,
          action: "MANUAL_ATTENDANCE_OVERRIDE",
          details: JSON.stringify({
            studentId: enrolment.studentId,
            matricNumber: enrolment.student.matricNumber,
            studentName: enrolment.student.fullName,
            previousStatus,
            newStatus: status,
            reason: reason.trim(),
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          })
        }
      });
      return Response.json({
        success: true,
        message: `Manual attendance recorded for ${enrolment.student.fullName} as ${status}.`,
        record
      });
    } catch (err) {
      console.error("[Manual Override Error]:", err);
      return Response.json({
        error: "Failed to apply manual attendance override."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "import") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      },
      include: {
        enrolments: {
          where: {
            status: "ACTIVE"
          },
          include: {
            student: {
              select: {
                matricNumber: true
              }
            }
          }
        }
      }
    });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({
        error: "Course not found or access denied."
      }, {
        status: 404
      });
    }
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) {
        return Response.json({
          error: "No file uploaded."
        }, {
          status: 400
        });
      }
      if (file.size > 10 * 1024 * 1024) {
        return Response.json({
          error: "File size exceeds 10MB limit."
        }, {
          status: 400
        });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parsed = await parseClassListFile(buffer, file.name);
      if (!parsed.success && parsed.validRows.length === 0) {
        return Response.json({
          error: "Could not extract student records from file.",
          details: parsed.invalidRows
        }, {
          status: 422
        });
      }
      const existingMatrics = new Set(course.enrolments.map((e) => e.student.matricNumber.toUpperCase()));
      const validRowsWithStatus = parsed.validRows.map((row) => ({
        ...row,
        isAlreadyEnrolled: existingMatrics.has(row.matricNumber.toUpperCase())
      }));
      return Response.json({
        success: true,
        fileName: file.name,
        totalExtracted: parsed.totalExtracted,
        validRows: validRowsWithStatus,
        invalidRows: parsed.invalidRows,
        detectedColumns: parsed.detectedColumns
      });
    } catch (err) {
      console.error("[Import Preview Error]:", err);
      return Response.json({
        error: "Failed to process class list file."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "import" && parts[3] === "commit") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    const courseId = parts[1];
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      }
    });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({
        error: "Course not found or access denied."
      }, {
        status: 404
      });
    }
    try {
      const body = await request.json();
      const result = commitSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Invalid student payload.",
          details: result.error.flatten()
        }, {
          status: 400
        });
      }
      const {
        students,
        actionOnExisting
      } = result.data;
      if (students.length === 0) {
        return Response.json({
          error: "No students provided for import."
        }, {
          status: 400
        });
      }
      let addedCount = 0;
      let updatedCount = 0;
      for (const s of students) {
        const cleanMatric = s.matricNumber.trim().toUpperCase();
        const cleanName = s.fullName.trim();
        const cleanEmail = s.email ? s.email.trim().toLowerCase() : null;
        const student = await prisma.student.upsert({
          where: {
            matricNumber: cleanMatric
          },
          create: {
            matricNumber: cleanMatric,
            fullName: cleanName,
            email: cleanEmail,
            department: s.department?.trim() || null,
            faculty: s.faculty?.trim() || null,
            level: s.level?.trim() || null,
            studentPin: s.studentPin?.trim() || null
          },
          update: actionOnExisting === "update" ? {
            fullName: cleanName,
            email: cleanEmail || void 0,
            department: s.department?.trim() || void 0,
            faculty: s.faculty?.trim() || void 0,
            level: s.level?.trim() || void 0,
            studentPin: s.studentPin?.trim() || void 0
          } : {}
        });
        await prisma.courseEnrolment.upsert({
          where: {
            courseId_studentId: {
              courseId: course.id,
              studentId: student.id
            }
          },
          create: {
            courseId: course.id,
            studentId: student.id,
            status: "ACTIVE"
          },
          update: {
            status: "ACTIVE"
          }
        });
        addedCount++;
      }
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "ROSTER_IMPORTED",
          details: JSON.stringify({
            totalProcessed: students.length,
            addedCount,
            updatedCount,
            actionOnExisting
          })
        }
      });
      return Response.json({
        success: true,
        message: `Successfully processed ${students.length} students into roster.`,
        addedCount,
        updatedCount
      });
    } catch (err) {
      console.error("[Commit Roster Error]:", err);
      const errorMessage = err?.message || "Failed to save student records to course roster. Please verify file format.";
      return Response.json({
        error: errorMessage
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 3 && parts[0] === "attendance" && parts[2] === "request-otp") {
    const token = parts[1];
    try {
      const body = await request.json();
      const result = requestOtpSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Matriculation number is required"
        }, {
          status: 400
        });
      }
      const cleanMatric = result.data.matricNumber.trim().toUpperCase();
      const session = await prisma.attendanceSession.findUnique({
        where: {
          token
        },
        include: {
          course: {
            select: {
              id: true,
              code: true
            }
          }
        }
      });
      if (!session || session.status !== "OPEN" || session.expiresAt < /* @__PURE__ */ new Date()) {
        return Response.json({
          error: "Attendance session is not active."
        }, {
          status: 403
        });
      }
      const student = await prisma.student.findUnique({
        where: {
          matricNumber: cleanMatric
        },
        include: {
          enrolments: {
            where: {
              courseId: session.courseId,
              status: "ACTIVE"
            }
          }
        }
      });
      if (!student || student.enrolments.length === 0) {
        return Response.json({
          error: "Matriculation number is not enrolled in this course."
        }, {
          status: 404
        });
      }
      if (!student.email) {
        return Response.json({
          error: "No registered institutional email found for this student. Please contact your lecturer to mark attendance manually or verify via PIN."
        }, {
          status: 400
        });
      }
      const rawOtp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const otpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await prisma.studentVerificationOTP.deleteMany({
        where: {
          sessionId: session.id,
          studentId: student.id,
          verifiedAt: null
        }
      });
      await prisma.studentVerificationOTP.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          email: student.email,
          otpHash,
          expiresAt
        }
      });
      await sendStudentOtpEmail(student.email, rawOtp, session.course.code);
      const [namePart, domainPart] = student.email.split("@");
      const maskedName = namePart.length <= 2 ? namePart[0] + "*" : namePart[0] + "*".repeat(namePart.length - 2) + namePart[namePart.length - 1];
      const maskedEmail = `${maskedName}@${domainPart}`;
      return Response.json({
        success: true,
        message: `Verification code sent to ${maskedEmail}`,
        maskedEmail,
        devOtp: process.env.NODE_ENV !== "production" ? rawOtp : void 0
      });
    } catch (err) {
      console.error("[Request OTP Error]:", err);
      return Response.json({
        error: "Failed to dispatch verification code."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 3 && parts[0] === "attendance" && parts[2] === "check-in") {
    const token = parts[1];
    try {
      const body = await request.json();
      const result = checkInSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Validation failed",
          details: result.error.flatten()
        }, {
          status: 400
        });
      }
      const {
        matricNumber,
        sessionPin,
        studentPin,
        otpCode,
        deviceId
      } = result.data;
      const cleanMatric = matricNumber.trim().toUpperCase().replace(/\\/g, "/");
      const session = await prisma.attendanceSession.findUnique({
        where: {
          token
        },
        include: {
          course: {
            select: {
              id: true,
              code: true,
              title: true
            }
          }
        }
      });
      if (!session) {
        return Response.json({
          error: "Attendance session does not exist or link is invalid."
        }, {
          status: 404
        });
      }
      const now = /* @__PURE__ */ new Date();
      if (session.status !== "OPEN" || session.expiresAt < now) {
        return Response.json({
          error: "This attendance session has ended or is currently closed. Please contact your lecturer."
        }, {
          status: 403
        });
      }
      if (session.sessionPin) {
        if (!sessionPin || sessionPin.trim() !== session.sessionPin.trim()) {
          return Response.json({
            error: "Invalid in-class attendance PIN. Please check the code projected on the classroom board."
          }, {
            status: 401
          });
        }
      }
      let student = await prisma.student.findUnique({
        where: {
          matricNumber: cleanMatric
        },
        include: {
          enrolments: {
            where: {
              courseId: session.courseId,
              status: "ACTIVE"
            }
          }
        }
      });
      if (!student || student.enrolments.length === 0) {
        student = await prisma.student.findFirst({
          where: {
            matricNumber: {
              equals: cleanMatric,
              mode: "insensitive"
            }
          },
          include: {
            enrolments: {
              where: {
                courseId: session.courseId,
                status: "ACTIVE"
              }
            }
          }
        });
      }
      if (!student || student.enrolments.length === 0) {
        return Response.json({
          error: `Matriculation number "${cleanMatric}" is not enrolled in ${session.course.code}.`
        }, {
          status: 404
        });
      }
      const enrolment = student.enrolments[0];
      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          sessionId_enrolmentId: {
            sessionId: session.id,
            enrolmentId: enrolment.id
          }
        }
      });
      if (existingRecord) {
        return Response.json({
          error: `Attendance already recorded for ${student.fullName} at ${formatDateTime(existingRecord.checkInTime)}. Duplicate check-ins are not permitted.`,
          alreadyRecorded: true,
          studentName: student.fullName,
          matricNumber: student.matricNumber,
          courseCode: session.course.code,
          checkInTime: existingRecord.checkInTime
        }, {
          status: 409
        });
      }
      if (session.verificationMethod === "STUDENT_PIN") {
        if (student.studentPin) {
          if (!studentPin || studentPin.trim() !== student.studentPin.trim()) {
            return Response.json({
              error: "Incorrect student verification PIN. Please verify your credentials."
            }, {
              status: 401
            });
          }
        }
      } else if (session.verificationMethod === "EMAIL_OTP") {
        if (!otpCode) {
          return Response.json({
            error: "One-time email verification code is required."
          }, {
            status: 400
          });
        }
        const otpHash = crypto.createHash("sha256").update(otpCode.trim()).digest("hex");
        const validOtp = await prisma.studentVerificationOTP.findFirst({
          where: {
            sessionId: session.id,
            studentId: student.id,
            otpHash,
            expiresAt: {
              gt: now
            },
            verifiedAt: null
          }
        });
        if (!validOtp) {
          return Response.json({
            error: "Invalid or expired one-time verification passcode."
          }, {
            status: 401
          });
        }
        await prisma.studentVerificationOTP.update({
          where: {
            id: validOtp.id
          },
          data: {
            verifiedAt: now
          }
        });
      }
      if (deviceId && deviceId.trim().length > 0) {
        const deviceConflict = await prisma.attendanceRecord.findFirst({
          where: {
            sessionId: session.id,
            enrolmentId: {
              not: enrolment.id
            },
            userAgent: {
              contains: `[device:${deviceId.trim()}]`
            }
          },
          include: {
            enrolment: {
              include: {
                student: true
              }
            }
          }
        });
        if (deviceConflict) {
          return Response.json({
            error: `Proxy Attendance Prevented: This device was already used to check in ${deviceConflict.enrolment.student.fullName} (${deviceConflict.enrolment.student.matricNumber}). Submitting attendance for absent students from the same phone is blocked.`
          }, {
            status: 403
          });
        }
      }
      const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const rawUserAgent = request.headers.get("user-agent") || "unknown";
      const userAgentWithDevice = deviceId && deviceId.trim().length > 0 ? `${rawUserAgent} [device:${deviceId.trim()}]` : String(rawUserAgent);
      const record = await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          enrolmentId: enrolment.id,
          status: "PRESENT",
          verificationMethod: session.verificationMethod,
          verificationStatus: "VERIFIED",
          checkInTime: now,
          ipAddress: String(ipAddress),
          userAgent: userAgentWithDevice,
          isManualOverride: false
        }
      });
      return Response.json({
        success: true,
        studentName: student.fullName,
        matricNumber: student.matricNumber,
        courseCode: session.course.code,
        courseTitle: session.course.title,
        checkInTime: record.checkInTime,
        message: "Attendance confirmed successfully. You have been marked PRESENT."
      });
    } catch (err) {
      if (err.code === "P2002") {
        return Response.json({
          error: "Attendance has already been recorded for this student in this session."
        }, {
          status: 409
        });
      }
      console.error("[Check-In Error]:", err);
      return Response.json({
        error: "Failed to confirm attendance. Please try again."
      }, {
        status: 500
      });
    }
  }
  if (parts.length === 1 && parts[0] === "settings") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({
        error: "Unauthorized"
      }, {
        status: 401
      });
    }
    try {
      const body = await request.json();
      const result = settingsSchema.safeParse(body);
      if (!result.success) {
        return Response.json({
          error: "Validation failed",
          details: result.error.flatten()
        }, {
          status: 400
        });
      }
      const data = result.data;
      const updatePayload = {
        fullName: data.fullName.trim(),
        institution: data.institution?.trim() || null,
        department: data.department?.trim() || null,
        timeZone: data.timeZone,
        defaultThreshold: data.defaultThreshold,
        defaultSessionDuration: data.defaultSessionDuration,
        defaultVerificationMethod: data.defaultVerificationMethod
      };
      if (data.newPassword && data.newPassword.trim().length > 0) {
        if (!data.currentPassword) {
          return Response.json({
            error: "Current password is required to set a new password."
          }, {
            status: 400
          });
        }
        const dbUser = await prisma.user.findUnique({
          where: {
            id: user.id
          }
        });
        if (!dbUser) {
          return Response.json({
            error: "User not found"
          }, {
            status: 404
          });
        }
        const isCurrentMatch = await verifyPassword(data.currentPassword, dbUser.passwordHash);
        if (!isCurrentMatch) {
          return Response.json({
            error: "Incorrect current password."
          }, {
            status: 400
          });
        }
        updatePayload.passwordHash = await hashPassword(data.newPassword);
      }
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id
        },
        data: updatePayload,
        select: {
          id: true,
          fullName: true,
          email: true,
          institution: true,
          department: true,
          timeZone: true,
          defaultThreshold: true,
          defaultSessionDuration: true,
          defaultVerificationMethod: true
        }
      });
      return Response.json({
        success: true,
        message: "Settings updated successfully.",
        user: updatedUser
      });
    } catch (err) {
      console.error("[Settings Update Error]:", err);
      return Response.json({
        error: "Failed to update profile settings."
      }, {
        status: 500
      });
    }
  }
  return Response.json({
    error: "Not Found"
  }, {
    status: 404
  });
}
const route25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CKOx1f3m.js", "imports": ["/assets/errorBoundaries-D9dqz2bv.js", "/assets/components-CXm0bddS.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-BkoTAPEW.js", "imports": ["/assets/errorBoundaries-D9dqz2bv.js", "/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js"], "css": ["/assets/root-BP_Z-cKN.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-DOWBu3hc.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/menu-BiL73WW2.js", "/assets/shield-check-32kxL_y0.js", "/assets/x-oLdX604U.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/clock-CDh03Qm1.js", "/assets/users-B7bsht7r.js", "/assets/qr-code-C1fYOT3S.js", "/assets/user-plus-C-QrrMvM.js", "/assets/check-DeGhUzp0.js", "/assets/lock-eqvskuCK.js", "/assets/circle-check-CGcK5QU1.js", "/assets/triangle-alert-BNfec_R9.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/login-BoyU3Ucy.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/circle-check-CGcK5QU1.js", "/assets/mail-7ggWDAcE.js", "/assets/lock-eqvskuCK.js", "/assets/eye-CBawudFl.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/utils-BsB8IB1y.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/register": { "id": "routes/register", "parentId": "root", "path": "register", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/register-zU1oVk0a.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/circle-check-CGcK5QU1.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/user-DyYXbrC-.js", "/assets/mail-7ggWDAcE.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/book-open-CLC1vmJR.js", "/assets/lock-eqvskuCK.js", "/assets/eye-CBawudFl.js", "/assets/utils-BsB8IB1y.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/forgot-password": { "id": "routes/forgot-password", "parentId": "root", "path": "forgot-password", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/forgot-password-CCcbQWhs.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/circle-check-CGcK5QU1.js", "/assets/arrow-left-jddP4zOq.js", "/assets/mail-7ggWDAcE.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/utils-BsB8IB1y.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/reset-password": { "id": "routes/reset-password", "parentId": "root", "path": "reset-password", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/reset-password--Rc6uCp_.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/circle-check-CGcK5QU1.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/lock-eqvskuCK.js", "/assets/eye-CBawudFl.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/utils-BsB8IB1y.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/verify-email": { "id": "routes/verify-email", "parentId": "root", "path": "verify-email", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/verify-email-C4jE5SF7.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/loader-circle-BIJGLoCZ.js", "/assets/circle-check-CGcK5QU1.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/utils-BsB8IB1y.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/dashboard": { "id": "routes/dashboard", "parentId": "root", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/dashboard-Bdf16t2f.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/DashboardLayout-DDGx2xUL.js", "/assets/utils-BsB8IB1y.js", "/assets/Badge-Dk3D0xns.js", "/assets/qr-code-C1fYOT3S.js", "/assets/book-open-CLC1vmJR.js", "/assets/users-B7bsht7r.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/clock-CDh03Qm1.js", "/assets/menu-BiL73WW2.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/x-oLdX604U.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/courses": { "id": "routes/courses", "parentId": "root", "path": "courses", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/courses-BtFhthP3.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/DashboardLayout-DDGx2xUL.js", "/assets/Badge-Dk3D0xns.js", "/assets/Modal-MnnHtJiw.js", "/assets/Button-BQEuNpsn.js", "/assets/check-DeGhUzp0.js", "/assets/DeleteCourseModal-C5B41Jhh.js", "/assets/book-open-CLC1vmJR.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/qr-code-C1fYOT3S.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/utils-BsB8IB1y.js", "/assets/menu-BiL73WW2.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/x-oLdX604U.js", "/assets/clock-CDh03Qm1.js", "/assets/triangle-alert-BNfec_R9.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/courses.new": { "id": "routes/courses.new", "parentId": "root", "path": "courses/new", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/courses.new-ChYXh_8v.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/DashboardLayout-DDGx2xUL.js", "/assets/lib-C9mPefsX.js", "/assets/Button-BQEuNpsn.js", "/assets/arrow-left-jddP4zOq.js", "/assets/book-open-CLC1vmJR.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/utils-BsB8IB1y.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/menu-BiL73WW2.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/x-oLdX604U.js", "/assets/clock-CDh03Qm1.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/courses.$courseId": { "id": "routes/courses.$courseId", "parentId": "root", "path": "courses/:courseId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/courses._courseId-Dd6cl6vf.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/DashboardLayout-DDGx2xUL.js", "/assets/lib-C9mPefsX.js", "/assets/Button-BQEuNpsn.js", "/assets/Badge-Dk3D0xns.js", "/assets/Modal-MnnHtJiw.js", "/assets/DeleteCourseModal-C5B41Jhh.js", "/assets/utils-BsB8IB1y.js", "/assets/qr-code-C1fYOT3S.js", "/assets/book-open-CLC1vmJR.js", "/assets/users-B7bsht7r.js", "/assets/clock-CDh03Qm1.js", "/assets/menu-BiL73WW2.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/user-plus-C-QrrMvM.js", "/assets/arrow-right-BH6kgD3D.js", "/assets/check-DeGhUzp0.js", "/assets/triangle-alert-BNfec_R9.js", "/assets/loader-circle-BIJGLoCZ.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/x-oLdX604U.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/courses.$courseId.edit": { "id": "routes/courses.$courseId.edit", "parentId": "root", "path": "courses/:courseId/edit", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/courses._courseId.edit-4qQ6bpbQ.js", "imports": ["/assets/components-CXm0bddS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/courses.$courseId.attendance.new": { "id": "routes/courses.$courseId.attendance.new", "parentId": "root", "path": "courses/:courseId/attendance/new", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/courses._courseId.attendance.new-D1mxgGwL.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/loader-circle-BIJGLoCZ.js", "/assets/arrow-left-jddP4zOq.js", "/assets/qr-code-C1fYOT3S.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/utils-BsB8IB1y.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/courses.$courseId.attendance.$sessionId": { "id": "routes/courses.$courseId.attendance.$sessionId", "parentId": "root", "path": "courses/:courseId/attendance/:sessionId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/courses._courseId.attendance._sessionId-BEhbap7c.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/Badge-Dk3D0xns.js", "/assets/Modal-MnnHtJiw.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/arrow-left-jddP4zOq.js", "/assets/clock-CDh03Qm1.js", "/assets/check-DeGhUzp0.js", "/assets/users-B7bsht7r.js", "/assets/utils-BsB8IB1y.js", "/assets/x-oLdX604U.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/students.$studentId": { "id": "routes/students.$studentId", "parentId": "root", "path": "students/:studentId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/students._studentId-DsSamB-v.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/DashboardLayout-DDGx2xUL.js", "/assets/Badge-Dk3D0xns.js", "/assets/utils-BsB8IB1y.js", "/assets/arrow-left-jddP4zOq.js", "/assets/user-DyYXbrC-.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/book-open-CLC1vmJR.js", "/assets/menu-BiL73WW2.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/x-oLdX604U.js", "/assets/clock-CDh03Qm1.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/attendance.$token": { "id": "routes/attendance.$token", "parentId": "root", "path": "attendance/:token", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/attendance._token-CSGK8hNd.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/lib-C9mPefsX.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/Button-BQEuNpsn.js", "/assets/loader-circle-BIJGLoCZ.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/clock-CDh03Qm1.js", "/assets/circle-check-CGcK5QU1.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/lock-eqvskuCK.js", "/assets/eye-CBawudFl.js", "/assets/shield-check-32kxL_y0.js", "/assets/utils-BsB8IB1y.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/settings": { "id": "routes/settings", "parentId": "root", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/settings-B33Fxzcr.js", "imports": ["/assets/components-CXm0bddS.js", "/assets/errorBoundaries-D9dqz2bv.js", "/assets/DashboardLayout-DDGx2xUL.js", "/assets/Button-BQEuNpsn.js", "/assets/check-DeGhUzp0.js", "/assets/user-DyYXbrC-.js", "/assets/clock-CDh03Qm1.js", "/assets/lock-eqvskuCK.js", "/assets/createLucideIcon-BdBPg5h-.js", "/assets/lib-C9mPefsX.js", "/assets/utils-BsB8IB1y.js", "/assets/book-open-CLC1vmJR.js", "/assets/menu-BiL73WW2.js", "/assets/graduation-cap-DI-4_fqb.js", "/assets/x-oLdX604U.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.auth.login": { "id": "routes/api.auth.login", "parentId": "root", "path": "api/auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.auth.login-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.auth.register": { "id": "routes/api.auth.register", "parentId": "root", "path": "api/auth/register", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.auth.register-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.auth.me": { "id": "routes/api.auth.me", "parentId": "root", "path": "api/auth/me", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.auth.me-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.auth.logout": { "id": "routes/api.auth.logout", "parentId": "root", "path": "api/auth/logout", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.auth.logout-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.auth.forgot-password": { "id": "routes/api.auth.forgot-password", "parentId": "root", "path": "api/auth/forgot-password", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.auth.forgot-password-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.auth.reset-password": { "id": "routes/api.auth.reset-password", "parentId": "root", "path": "api/auth/reset-password", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.auth.reset-password-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.auth.verify-email": { "id": "routes/api.auth.verify-email", "parentId": "root", "path": "api/auth/verify-email", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.auth.verify-email-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.health": { "id": "routes/api.health", "parentId": "root", "path": "api/health", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.health-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.$": { "id": "routes/api.$", "parentId": "root", "path": "api/*", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api._-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-b7044099.js", "version": "b7044099", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_enableNodeReadableStream": false, "unstable_optimizeDeps": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/register": {
    id: "routes/register",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/forgot-password": {
    id: "routes/forgot-password",
    parentId: "root",
    path: "forgot-password",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/reset-password": {
    id: "routes/reset-password",
    parentId: "root",
    path: "reset-password",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/verify-email": {
    id: "routes/verify-email",
    parentId: "root",
    path: "verify-email",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/dashboard": {
    id: "routes/dashboard",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/courses": {
    id: "routes/courses",
    parentId: "root",
    path: "courses",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/courses.new": {
    id: "routes/courses.new",
    parentId: "root",
    path: "courses/new",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/courses.$courseId": {
    id: "routes/courses.$courseId",
    parentId: "root",
    path: "courses/:courseId",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/courses.$courseId.edit": {
    id: "routes/courses.$courseId.edit",
    parentId: "root",
    path: "courses/:courseId/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/courses.$courseId.attendance.new": {
    id: "routes/courses.$courseId.attendance.new",
    parentId: "root",
    path: "courses/:courseId/attendance/new",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/courses.$courseId.attendance.$sessionId": {
    id: "routes/courses.$courseId.attendance.$sessionId",
    parentId: "root",
    path: "courses/:courseId/attendance/:sessionId",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/students.$studentId": {
    id: "routes/students.$studentId",
    parentId: "root",
    path: "students/:studentId",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/attendance.$token": {
    id: "routes/attendance.$token",
    parentId: "root",
    path: "attendance/:token",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/settings": {
    id: "routes/settings",
    parentId: "root",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/api.auth.login": {
    id: "routes/api.auth.login",
    parentId: "root",
    path: "api/auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "routes/api.auth.register": {
    id: "routes/api.auth.register",
    parentId: "root",
    path: "api/auth/register",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "routes/api.auth.me": {
    id: "routes/api.auth.me",
    parentId: "root",
    path: "api/auth/me",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "routes/api.auth.logout": {
    id: "routes/api.auth.logout",
    parentId: "root",
    path: "api/auth/logout",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "routes/api.auth.forgot-password": {
    id: "routes/api.auth.forgot-password",
    parentId: "root",
    path: "api/auth/forgot-password",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "routes/api.auth.reset-password": {
    id: "routes/api.auth.reset-password",
    parentId: "root",
    path: "api/auth/reset-password",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "routes/api.auth.verify-email": {
    id: "routes/api.auth.verify-email",
    parentId: "root",
    path: "api/auth/verify-email",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  },
  "routes/api.health": {
    id: "routes/api.health",
    parentId: "root",
    path: "api/health",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "routes/api.$": {
    id: "routes/api.$",
    parentId: "root",
    path: "api/*",
    index: void 0,
    caseSensitive: void 0,
    module: route25
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
