# Concurrent-world
Concurrent-worldは分散マイクロブログ基盤である[Concurrent](https://github.com/totegamma/concurrent)のwebクライアント実装の1つです。
現在は絶賛開発中で、最低限の機能しかありません。

現在は [concurrent.world](https://concurrent.world)で公開されています。

### 世界は一つ
Concurrentを始めるのに、所属するコミュニティを選ぶ必要はありません。 
アカウントを作成すれば、誰とでもつながることができ、好きな話題同士で集まったコミュニティタイムライン(concurrentではストリームと呼びます)で交流できます。

### 環境は無数
発信する内容はどうしてもそのサーバーが設置してある国や、運用している団体により検閲・制限されてしまいます。
これ自体は仕方ないことですが、利用者としては自身が身を置く環境は選びたいものです。 
Concurrentは分散型なので、自身の発言を管理してくれる「ホスト」を自分で選ぶことができます。もちろん、ホストは自分で建てることもできますよ！

## Getting Started
### 前準備
nodeとpnpmがインストールされている必要があります。  

> [volta](https://volta.sh/) を使うことをお勧めします。
> ```shell
> # package.jsonで指定されているNode.jsをインストールする
> volta install node
> volta install pnpm
> ```

```
pnpm i
```

### devビルド
```
pnpm dev
```
### 本番ビルド
```
pnpm build
```

### schemaファイルの生成
concurrentはサーバー間でやりとりするオブジェクトのIDと内容をjsonSchemaで担保しています。
利用するjsonSchemaを`src/schemas.ts`で定義し、以下のコマンドを実行すると外部からjsonSchemaをダウンロードし、typescriptの型定義に変換した上で`src/schemas/`へ格納してくれます。

```
deno run -A collectSchemas.ts
```

`dist/`下に成果物が出力されます。

## Contributing
現在は絶賛開発中な為、PR前にissueの起票をお願いします。

大きいissueを除いて基本的にはissueとPRは1対1対応になるようにします。

issueはその仕様が妥当かどうかの議論に、はPRその実装が妥当かどうかの議論に使います。
