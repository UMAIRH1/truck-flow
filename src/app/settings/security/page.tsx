"use client";

import { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateCurrent = (val: string) => {
    if (!val || !val.trim()) return "Current password is required";
    return "";
  };

  const validateNew = (val: string) => {
    if (!val || val.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(val)) return "Include at least one uppercase letter";
    if (!/[a-z]/.test(val)) return "Include at least one lowercase letter";
    if (!/[0-9]/.test(val)) return "Include at least one number";
    return "";
  };

  const validateConfirm = (val: string, newVal = newPassword) => {
    if (!val) return "Please confirm your new password";
    if (val !== newVal) return "Passwords do not match";
    return "";
  };

  const validateAll = () => {
    const c = validateCurrent(currentPassword);
    const n = validateNew(newPassword);
    const co = validateConfirm(confirmPassword);
    setErrors({ current: c || undefined, new: n || undefined, confirm: co || undefined });
    return !c && !n && !co;
  };

  function handleSavePassword() {
    if (!validateAll()) return;
    console.log("Save password", { currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    alert("Password updated (demo)");
  }

  const canSave = validateCurrent(currentPassword) === "" && validateNew(newPassword) === "" && validateConfirm(confirmPassword, newPassword) === "";

  return (
    <MobileLayout showFAB={true}>
      <Header title="Security" showBack />
      <div className=" max-w-7xl mx-auto sm:mt-7 max-sm:bg-(--color-yellow-light)">
        <section className="bg-white px-4 py-6 max-sm:rounded-t-2xl sm:rounded md:shadow-md md:border border-gray-200">
          <h3 className="text-xl font-semibold mb-3">Change password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Current password</label>
              <div className="relative">
                <Input
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setErrors((p) => ({ ...p, current: validateCurrent(e.target.value) || undefined }));
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, current: validateCurrent(currentPassword) || undefined }))}
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="w-full px-4 pr-10 !py-6 border !border-gray-200 !rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                  aria-label={showCurrent ? "Hide current password" : "Show current password"}
                >
                  {showCurrent ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {errors.current && <p className="text-xs text-red-500 mt-1">{errors.current}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">New password</label>
              <div className="relative">
                <Input
                  value={newPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewPassword(val);
                    setErrors((p) => ({ ...p, new: validateNew(val) || undefined, confirm: validateConfirm(confirmPassword, val) || undefined }));
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, new: validateNew(newPassword) || undefined }))}
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full px-4 pr-10 !py-6 border !border-gray-200 !rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters and include an uppercase letter and a number.</p>
              {errors.new && <p className="text-xs text-red-500 mt-1">{errors.new}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Confirm password</label>
              <div className="relative">
                <Input
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmPassword(val);
                    setErrors((p) => ({ ...p, confirm: validateConfirm(val, newPassword) || undefined }));
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, confirm: validateConfirm(confirmPassword, newPassword) || undefined }))}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full px-4 pr-10 !py-6 border !border-gray-200 !rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSavePassword}
                disabled={!canSave}
                className={`w-full md:w-44 h-11 py-2 px-4 rounded-lg text-base font-medium transition-colors ${canSave ? "bg-black text-white" : "bg-black text-gray-400 cursor-not-allowed"}`}
              >
                Save
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
