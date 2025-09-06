//定义用户相关数据的ts类型
//用户登录接口携带参数的ts类型
export interface loginFormData {
    username: string,
    password: string
}

//定义全部接口返回数据都拥有ts类型
export interface ResponseData {
    code: number,
    message: string,
    ok: boolean
}

//定义登录接口返回数据类型
export interface loginResponseData extends ResponseData {

    data: {
        token: string;
        username: string;
        userId: number;
    };
}

// 修正：与实际返回的用户信息结构完全匹配
export interface userInfoReponseData {
    id: number;
    username: string; // 存在username字段
    avatar: string;   // 存在avatar字段
    desc: string;
    createdAt: string;
    updatedAt: string;
    roles: string[];
    buttons: string[]; // 存在buttons字段
    routes: string[];  // 存在routes字段
}