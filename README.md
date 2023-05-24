# Concurrent-web
Concurren-webは分散マイクロブログ基盤である[Concurrent](https://github.com/totegamma/concurrent)のwebクライアント実装の1つです。
現在は絶賛開発中で、最低限の機能しかありません。

## Motivation of Concurrent
本体であるConcurrentは、「セルフホストでお一人様インスタンス建てたい！けどローカルが1人ぼっちなのは寂しい...」という問題を解決するために生まれました。

完全検閲フリーを目指しているnostrと比較すると、Concurrentは自分のメッセージ本体を格納するDBと、メッセージ送信先のストリームをホストするサーバーのガバナンス*の影響は受けてしまいます。
しかし、前者はセルフホストすることで解決し、後者はそれはそれで正しいと考えているため問題にはなりません。

<small>ガバナンス: ここで言うガバナンスとは、サービス終了によるデータの消失や、サーバー管理者に発言を削除されることを指す。</small>

## Getting Started
### 前準備
nodeとpnpmがインストールされている必要があります。
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
