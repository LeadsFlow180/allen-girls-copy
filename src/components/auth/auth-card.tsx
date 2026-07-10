"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Heart, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "@/components/auth/auth-card.module.css";

type AuthMode = "login" | "signup";
type Role = "parent" | "teacher";

type FieldConfig = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
};

const roleLabels: Record<Role, string> = {
  parent: "Parent",
  teacher: "Teacher",
};

const fieldConfigByMode: Record<AuthMode, Record<Role, FieldConfig[]>> = {
  login: {
    parent: [
      { id: "parent-email", label: "Email", type: "email", placeholder: "parent@example.com" },
      { id: "parent-password", label: "Password", type: "password", placeholder: "Enter your password" },
    ],
    teacher: [
      { id: "teacher-email", label: "School Email", type: "email", placeholder: "teacher@school.edu" },
      { id: "teacher-password", label: "Password", type: "password", placeholder: "Enter your password" },
    ],
  },
  signup: {
    parent: [
      { id: "parent-full-name", label: "Full Name", type: "text", placeholder: "Jane Parent" },
      { id: "parent-email-signup", label: "Email", type: "email", placeholder: "parent@example.com" },
      { id: "parent-child-name", label: "Child Name", type: "text", placeholder: "Maya" },
      { id: "parent-password-signup", label: "Password", type: "password", placeholder: "Create a password" },
    ],
    teacher: [
      { id: "teacher-full-name", label: "Full Name", type: "text", placeholder: "Sam Teacher" },
      { id: "teacher-school-email", label: "School Email", type: "email", placeholder: "teacher@school.edu" },
      { id: "teacher-school-name", label: "School Name", type: "text", placeholder: "Sunrise Academy" },
      { id: "teacher-password-signup", label: "Password", type: "password", placeholder: "Create a password" },
    ],
  },
};

type AuthCardProps = {
  mode: AuthMode;
};

export const AuthCard = ({ mode }: AuthCardProps) => {
  const [role, setRole] = useState<Role>("parent");
  const isLogin = mode === "login";
  const activeFields = fieldConfigByMode[mode][role];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={styles.card}
    >
      <div className="relative">
        <div className={styles.badge}>
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-600" />
          {isLogin ? "Secure Login" : "New Account"}
        </div>
        <p className={styles.intro}>
          {isLogin
            ? "Pick your role and continue your learning adventure."
            : "Choose your role and start your classroom adventure in minutes."}
        </p>

        <Tabs value={role} onValueChange={(value) => setRole(value as Role)} className="mt-6">
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="parent" className={`data-[state=active]:bg-white ${styles.tabsTrigger}`}>
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Parent
              </span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className={`data-[state=active]:bg-white ${styles.tabsTrigger}`}>
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-500" />
                Teacher
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={role} className="mt-4">
            <AnimatePresence mode="wait">
              <motion.form
                key={`${mode}-${role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className={styles.roleChip}>
                  <Users className="h-4 w-4 text-slate-500" />
                  {roleLabels[role]} account selected
                </div>

                {activeFields.map((field) => (
                  <div key={field.id} className={styles.fieldWrap}>
                    <label htmlFor={field.id} className={styles.label}>
                      {field.label}
                    </label>
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      className={styles.input}
                    />
                  </div>
                ))}

                {isLogin && (
                  <div className={styles.loginMeta}>
                    <label className={styles.remember}>
                      <input type="checkbox" className="rounded border-slate-300" />
                      Remember me
                    </label>
                    <button type="button" className={styles.forgot}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" className={styles.submit}>
                  {isLogin ? `Login as ${roleLabels[role]}` : `Sign up as ${roleLabels[role]}`}
                </Button>
              </motion.form>
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        <p className={styles.switchText}>
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <Link href={isLogin ? "/signup" : "/login"} className={styles.switchLink}>
            {isLogin ? "Sign up here" : "Login here"}
          </Link>
        </p>
      </div>
    </motion.section>
  );
};
