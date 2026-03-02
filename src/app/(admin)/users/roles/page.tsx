"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { rolePermissions } from "@/lib/permissions";
import type { Role } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";

const ROLES: Role[] = ["admin", "manager", "accountant", "sales_agent", "warehouse", "production"];

const MODULES = [
  "dashboard",
  "sales",
  "inventory",
  "production",
  "customers",
  "commissions",
  "accounting",
  "users",
  "reports",
  "suppliers",
] as const;

const ACTIONS = ["view", "create", "edit", "delete"] as const;

function RoleLabel({ role }: { role: string }) {
  return (
    <span className="capitalize font-medium">{role.replace("_", " ")}</span>
  );
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
        <p className="text-sm text-slate-500">
          Overview of what each role can access across modules
        </p>
      </div>

      {ROLES.map((role) => {
        const perms = rolePermissions[role];
        return (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="info" className="capitalize">
                  {role.replace("_", " ")}
                </Badge>
              </CardTitle>
              <CardDescription>
                Permissions matrix for the <RoleLabel role={role} /> role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      {ACTIONS.map((a) => (
                        <TableHead key={a} className="text-center capitalize">
                          {a}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULES.map((mod) => {
                      const modPerms = perms?.[mod];
                      return (
                        <TableRow key={mod}>
                          <TableCell className="capitalize font-medium">{mod}</TableCell>
                          {ACTIONS.map((action) => {
                            const has = modPerms?.includes(action) ?? false;
                            return (
                              <TableCell key={action} className="text-center">
                                {has ? (
                                  <CheckCircle className="inline h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="inline h-4 w-4 text-slate-300" />
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
