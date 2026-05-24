# 相川光生 オフィシャルサイト

経営者・相川光生氏のオフィシャルサイト。静的HTML1ファイル構成（画像はインライン埋め込み）。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | サイト本体（トップページ。Netlifyが自動認識） |
| `netlify.toml` | Netlify設定（公開ディレクトリ・セキュリティヘッダ） |
| `.gitignore` | Git除外設定 |

---

## デプロイ手順（GitHub → Netlify 連携）

### STEP 1. GitHub にリポジトリを作成してファイルを上げる

**方法A: GitHub Web 画面（コマンド不要・簡単）**
1. https://github.com/new で新規リポジトリを作成（例: `aikawa-mitsuo-site`、Public/Private どちらでも可）。
2. 作成後の画面で「uploading an existing file」をクリック。
3. このフォルダ内の `index.html` / `netlify.toml` / `aikawa-contact.gs` / `.gitignore` をドラッグ&ドロップ。
4. 「Commit changes」を押す。

**方法B: コマンド（gitに慣れている場合）**
```bash
cd <このフォルダ>
git init
git add .
git commit -m "Initial commit: 相川光生 オフィシャルサイト"
git branch -M main
git remote add origin https://github.com/Shun5/aikawa-mitsuo-site.git
git push -u origin main
```

### STEP 2. Netlify と GitHub を連携

1. https://app.netlify.com にログイン。
2. 「Add new site」→「Import an existing project」を選択。
3. 「Deploy with GitHub」を選び、GitHub認証 → STEP 1 のリポジトリを選択。
4. ビルド設定はそのままでOK（`netlify.toml` で `publish = "."` を指定済み。Build commandは空のまま）。
5. 「Deploy site」を押す。数十秒で `https://<ランダム名>.netlify.app` が発行される。

### STEP 3. 公開後の更新

GitHubのファイルを更新（Web画面で編集 or `git push`）すると、Netlifyが自動で再ビルド・再公開する。手動操作は不要。

### STEP 4.（任意）独自ドメイン・サイト名

- Netlify管理画面 →「Domain settings」でサイト名（サブドメイン）を変更可能。
- 独自ドメインを持っている場合も同画面から接続できる。
