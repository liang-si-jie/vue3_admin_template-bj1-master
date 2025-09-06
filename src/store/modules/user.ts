//创建用户相关的小仓库
import { defineStore } from 'pinia';
//引入接口
import { reqLogin, reqUserInfo, reqLogout } from '@/api/user';
import type { loginFormData, loginResponseData, userInfoReponseData } from "@/api/user/type";
import type { UserState } from './types/type';
//引入操作本地存储的工具方法
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '@/utils/token';
//引入路由(常量路由)
import { constantRoute, asnycRoute, anyRoute } from '@/router/routes';

//引入深拷贝方法
//@ts-ignore
import cloneDeep from 'lodash/cloneDeep'
import router from '@/router';
//用于过滤当前用户需要展示的异步路由
function filterAsyncRoute(asnycRoute: any, routes: any) {
    return asnycRoute.filter((item: any) => {
        if (routes.includes(item.name)) {
            if (item.children && item.children.length > 0) {
                //硅谷333账号:product\trademark\attr\sku
                item.children = filterAsyncRoute(item.children, routes);
            }
            return true;
        }
    })
}

//创建用户小仓库
let useUserStore = defineStore('User', {
    //小仓库存储数据地方
    state: (): UserState => {
        return {
            token: GET_TOKEN(),//用户唯一标识token
            menuRoutes: constantRoute,//仓库存储生成菜单需要数组(路由)
            username: '',
            avatar: '',
            //存储当前用户是否包含某一个按钮
            buttons: [],
        }
    },
    //异步|逻辑的地方
    actions: {
        //用户登录的方法
        // 修改userLogin方法中token的获取逻辑
        // src/store/modules/user.ts（确认代码如下）
        async userLogin(loginForm: loginFormData) {
            try {
                console.log('仓库中开始执行登录请求:', loginForm);
                const result = await reqLogin(loginForm); // 直接使用，result 就是完整响应
                console.log('仓库中登录请求返回结果:', result);
                console.log('判断条件:', result.code === 200 && result.ok); // 应输出 true

                // 正确判断：使用外层的 code 和 ok（而非 data 中的）
                if (result.code === 200 && result.ok) {
                    this.token = result.data.token;
                    localStorage.setItem('TOKEN', result.data.token);
                    console.log('TOKEN', result.data.token);
                    console.log('登录成功，返回 "ok"'); // 新增日志
                    return 'ok'; // 必须返回 'ok'
                } else {
                    return Promise.reject(new Error(result.message || '登录失败'));
                }
            } catch (error) {
                console.log('仓库中登录请求报错:', error);
                return Promise.reject(error);
            }
        }

        ,

       async userInfo() {
    try {
        // 获取用户信息响应
        const response = await reqUserInfo();
        console.log('用户信息接口返回:', response);
        
        // 注意：接口直接返回用户信息对象，无需通过.data访问
        const userData = response.data;
        console.log("用户数据:", userData);

        // 直接从用户数据对象中获取字段
        this.username = userData.username;
        this.avatar = userData.avatar;
        this.buttons = userData.buttons || [];

        // 输出用户信息
        console.log("username:", userData.username);
        console.log("buttons:", userData.buttons);
        console.log("avatar:", userData.avatar);

        // 处理动态路由
        let userAsyncRoute = filterAsyncRoute(cloneDeep(asnycRoute), userData.routes);
        this.menuRoutes = [...constantRoute, ...userAsyncRoute, anyRoute];
        [...userAsyncRoute, anyRoute].forEach((route: any) => {
            router.addRoute(route);
        });
        return 'ok';
    } catch (error) {
        console.error('userInfo方法执行出错:', error);
        throw error;
    }
}
,
        //退出登录
        async userLogout() {
            console.log('触发登出的调用栈:', new Error().stack);
            //退出登录请求
            let result: any = await reqLogout();
            if (result.code == 200) {
                //目前没有mock接口:退出登录接口(通知服务器本地用户唯一标识失效)
                this.token = '';
                this.username = '';
                this.avatar = '';
                REMOVE_TOKEN();
                return 'ok';
            } else {
                return Promise.reject(new Error(result.message));
            }

        }

    },
    getters: {

    }
})
//对外暴露获取小仓库方法
export default useUserStore;