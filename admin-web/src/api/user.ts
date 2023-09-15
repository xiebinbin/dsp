import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { GetListDto, SuperUser, User } from "@/shims";

export interface UserEditDto {
  nickname: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  enabled: boolean;
  role: "Root" | "Operator" | "Agent";
}

const getList = (
  params: GetListDto
): Promise<{ data: SuperUser[]; total: number }> => {
  return createRequestInstance().post("/api/admin/users/list", params);
};
const getAgentsList = (
  params: GetListDto
): Promise<{ data: User[]; total: number }> => {
  return createRequestInstance().post("/api/admin/users/agentslist", params);
};
const getInfo = (id: bigint): Promise<SuperUser> => {
  return createRequestInstance().get(`/api/admin/users/${id}`);
};
const create = (params: UserEditDto): Promise<SuperUser> => {
  return createRequestInstance().post("/api/admin/users/store", params);
};
const update = (id: bigint, params: UserEditDto): Promise<SuperUser> => {
  return createRequestInstance().put(`/api/admin/users/${id}`, params);
};

const remove = (id: bigint): Promise<boolean> => {
  return createRequestInstance().delete(`/api/admin/users/${id}`);
};

export default {
  create,
  getInfo,
  update,
  getList,
  getAgentsList,
  remove,
};
