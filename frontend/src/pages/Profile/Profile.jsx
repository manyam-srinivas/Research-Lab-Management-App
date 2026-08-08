import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";

import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import { showSuccess, showError } from "../../utils/toast";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/authService";

const inputCls =
  "w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";
const labelCls =
  "block mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-300";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
        {value || "—"}
      </p>
    </div>
  );
}

export default function Profile() {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwSaving, setPwSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getProfile(token);
      setProfile(res.user);
      setForm({
        full_name: res.user.name || "",
        phone: res.user.phone || "",
        designation: res.user.designation || "",
        research_interests: res.user.research_interests || "",
        student_employee_id: res.user.student_employee_id || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(token, form);
      showSuccess("Profile updated successfully");
      load();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async () => {
    if (pw.new_password !== pw.confirm_password) {
      showError("New passwords do not match");
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(token, pw.old_password, pw.new_password);
      showSuccess("Password changed successfully");
      setPw({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-slate-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  const initials = (profile.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
          {initials}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {profile.name}
            </h2>
            <StatusBadge status={profile.role || "Member"} size="sm" />
          </div>
          <p className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500 dark:text-slate-400">
            <FaEnvelope /> {profile.email}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {profile.department_name || "No department assigned"}
            {profile.designation ? ` · ${profile.designation}` : ""}
          </p>
        </div>

        <StatusBadge status={profile.status || "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6">
          <h3 className="mb-5 font-semibold text-slate-800 dark:text-slate-100">
            Personal Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 …"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Designation</label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Assistant Professor"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Student / Employee ID</label>
              <input
                name="student_employee_id"
                value={form.student_employee_id}
                onChange={handleChange}
                placeholder="e.g. 21BCS101"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Research interests</label>
              <textarea
                name="research_interests"
                value={form.research_interests}
                onChange={handleChange}
                rows="3"
                placeholder="Machine learning, computer vision…"
                className={`${inputCls} resize-none`}
              />
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        {/* Account summary + password */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6">
            <h3 className="mb-5 font-semibold text-slate-800 dark:text-slate-100">
              Account Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Role" value={profile.role} />
              <Field label="Status" value={profile.status} />
              <Field label="Department" value={profile.department_name} />
              <Field label="Member since" value={profile.created_at?.slice(0, 10)} />
              <Field label="Student/Employee ID" value={profile.student_employee_id} />
              <Field
                label="Email verified"
                value={
                  profile.email_verified === undefined
                    ? "—"
                    : profile.email_verified
                      ? "Yes"
                      : "No"
                }
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6">
            <h3 className="mb-5 font-semibold text-slate-800 dark:text-slate-100">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Current password</label>
                <input
                  type="password"
                  value={pw.old_password}
                  onChange={(e) =>
                    setPw({ ...pw, old_password: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>New password</label>
                <input
                  type="password"
                  value={pw.new_password}
                  onChange={(e) =>
                    setPw({ ...pw, new_password: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Confirm new password</label>
                <input
                  type="password"
                  value={pw.confirm_password}
                  onChange={(e) =>
                    setPw({ ...pw, confirm_password: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <Button onClick={handlePassword} disabled={pwSaving}>
                {pwSaving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
