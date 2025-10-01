import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set) => ({
      user_id: null,
      username: null,
      role: "user",
      authLoading: false,

      login: async (data, onSuccess) => {
        set({ authLoading: true });
        try {
          const res = await axios.post("auth/login", data);

          if (res.status === 200) {
            const user = res.data.user;

            set({
              user_id: user.user_id,
              role: user.role,
              username: user.username,
            });

            setTimeout(() => {
              set({ authLoading: false });
              onSuccess?.();
            }, 1000);
          }
        } catch (error) {
          setTimeout(() => {
            set({ authLoading: false });
            toast.error(error.response?.data?.message || "Login Unsuccessful");
          }, 1000);
        }
      },

      logout: async (onSuccess) => {
        set({ authLoading: true });
        try {
          const res = await axios.post("auth/logout");
          if (res.status === 200) {
            set({ user_id: null, username: null, role: "user" });
            toast.success("Logout successful");
            onSuccess?.();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Logout Unsuccessful");
        } finally {
          set({ authLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // key in localStorage
      partialize: (state) => ({
        user_id: state.user_id,
        username: state.username,
        role: state.role,
      }),
    }
  )
);
