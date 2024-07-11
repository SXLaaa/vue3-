# 第一阶段：构建
# FROM node:latest as builder
FROM node:20-bullseye-slim as builder

WORKDIR /app

# 只复制package.json和yarn.lock，确保依赖项在Docker容器中安装
COPY package*.json ./

# 检测node版本
RUN node -v

# 使用Yarn安装依赖
RUN yarn install

# 复制其余的源代码
COPY . .

# 构建Vue应用
RUN yarn run build

# 第二阶段：Nginx服务阶段
FROM nginx:latest

# 复制Nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 将构建好的dist目录复制到Nginx的默认目录
COPY --from=builder /app/dist /usr/share/nginx/html
