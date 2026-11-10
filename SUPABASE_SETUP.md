# 云合排行榜在线存储

静态 GitHub Pages 页面不能自行保存各参与者的分数。本项目使用 Supabase Postgres 存成绩，并通过数据库函数只返回全站前五名和当前浏览器对应的本人记录。

## 当前项目

- 项目：`yunhe-rain-heat-leaderboard`
- 区域：Supabase 自动选择的 Sydney (`ap-southeast-2`)
- 数据库脚本：[`supabase/leaderboard.sql`](supabase/leaderboard.sql)
- 浏览器连接配置：[`leaderboard-config.js`](leaderboard-config.js)

页面仅使用 Supabase Publishable key；该密钥用于浏览器并受数据库权限控制。不要把 Secret key 或数据库密码提交到仓库。

排行榜使用浏览器生成的随机 ID；昵称仅在进入前五名时向所有访客显示。每个 ID 保留最佳分数，未进入前五名的访客只会收到自己的排名和分数。若要重建数据库，在项目的 SQL Editor 中运行 [`supabase/leaderboard.sql`](supabase/leaderboard.sql)。
