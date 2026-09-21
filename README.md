# JavaAtlas

Javaのコード例・仕組み・例外・コンパイル診断・論理的な落とし穴を、検索と学習マップから逆引きできるリファレンスです。

LanguageAtlas-templateをベースにしつつ、Java向けの記事、バージョン情報、トピック、学習順を収録しています。

## Features

- コードレシピ、仕組み、例外、コンパイルエラー、コンパイル警告、論理エラーを横断検索
- 日本語 / English のローカライズ
- Javaバージョン互換性を記事ごとに管理
- トピック・種類による絞り込み
- お気に入り / 最近見た記事
- 推奨順の学習マップ
- Cloudflare Pagesで配信できる静的Viteサイト

## Java version metadata

記事データでは、Javaのバージョン差を扱うために `since`、必要に応じて `until`、`status` を持たせます。

```json
{
  "id": "stream-to-list",
  "type": "code",
  "since": 16,
  "until": null,
  "status": "standard"
}
```

基本対象はJava 8以降です。Previewやdeprecatedな機能は通常のstandard機能と区別して扱います。

## Content

主なデータは以下にあります。

- `public/language.config.json`: JavaAtlas固有のサイト設定
- `public/content/articles/*.json`: 記事のベースデータ
- `public/content/locales/ja/*.json`: 日本語本文
- `public/content/locales/en/*.json`: 英語本文
- `public/content/types.json`: 記事タイプ
- `public/content/topics.json`: トピック
- `public/content/learning-map.json`: 推奨学習順
- `public/content/learning-map-code.json`: 学習マップ用の代表コード

記事本文とメタデータはGit管理し、ブラウザ側で検索・絞り込み・関連表示を行います。

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```

コンテンツ追加時は、記事IDの重複、ja/enの対応、`related` の参照先、Javaバージョン情報などをテストで検証します。

## Base template

共通UI・検索・学習マップなどの基盤は [LanguageAtlas-template](https://github.com/kineticnapier/LanguageAtlas-template) を元にしています。Java固有の内容は設定とコンテンツ側へ分離し、共通ランタイムをできるだけ再利用する構成です。
