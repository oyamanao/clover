'use client';

import { Clover, PlusCircle, Sparkles } from "lucide-react";
import { UserNav } from "@/components/app/user-nav";
import { Button } from "../ui/button";
import { useFirebase } from "@/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useFirebase();
  const pathname = usePathname();

  // Header is no longer used. Replaced by FloatingNav.
  return null;
}
