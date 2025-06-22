<template>
  <div class="users-container">
    <n-card title="User Management" class="users-card">
      <template #header-extra>
        <n-button type="primary">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
            </n-icon>
          </template>
          Add User
        </n-button>
      </template>

      <n-data-table
        :columns="columns"
        :data="userData"
        :bordered="false"
        class="users-table"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import { NButton, NTag, NAvatar, NIcon } from "naive-ui";

const columns = [
  {
    title: "User",
    key: "user",
    render(row: any) {
      return h(
        "div",
        { style: "display: flex; align-items: center; gap: 12px" },
        [
          h(NAvatar, { size: "small", src: row.avatar }),
          h("div", [
            h("div", { style: "font-weight: 500; color: #ffffffd1" }, row.name),
            h("div", { style: "font-size: 12px; color: #ffffff73" }, row.email),
          ]),
        ],
      );
    },
  },
  {
    title: "Role",
    key: "role",
    render(row: any) {
      const tagType =
        row.role === "Admin"
          ? "error"
          : row.role === "Moderator"
            ? "warning"
            : "info";
      return h(NTag, { type: tagType }, { default: () => row.role });
    },
  },
  {
    title: "Status",
    key: "status",
    render(row: any) {
      const tagType = row.status === "Active" ? "success" : "default";
      return h(NTag, { type: tagType }, { default: () => row.status });
    },
  },
  {
    title: "Last Login",
    key: "lastLogin",
  },
  {
    title: "Actions",
    key: "actions",
    render(row: any) {
      return h("div", { style: "display: flex; gap: 8px" }, [
        h(
          NButton,
          {
            size: "small",
            type: "primary",
            quaternary: true,
          },
          { default: () => "Edit" },
        ),
        h(
          NButton,
          {
            size: "small",
            type: "error",
            quaternary: true,
          },
          { default: () => "Delete" },
        ),
      ]);
    },
  },
];

const userData = [
  {
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2 hours ago",
    avatar: "",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Moderator",
    status: "Active",
    lastLogin: "1 day ago",
    avatar: "",
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
    lastLogin: "1 week ago",
    avatar: "",
  },
  {
    name: "Alice Brown",
    email: "alice@example.com",
    role: "User",
    status: "Active",
    lastLogin: "3 hours ago",
    avatar: "",
  },
];
</script>

<style scoped>
.users-container {
  max-width: 1200px;
  margin: 0 auto;
}

.users-card {
  background-color: #18181c !important;
  border: 1px solid #2c2c32 !important;
}

.users-table {
  background-color: transparent !important;
}
</style>
