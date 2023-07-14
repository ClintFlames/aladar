const { readFileSync, writeFileSync, existsSync } = require("fs");
const { BannerPlugin } = require("webpack");
const path = require("path");

module.exports = {
	mode: "development",
	entry: path.join(__dirname, "src", "index.ts"),
	module: {
		rules: [
			{ test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/, },
			{ test: /\.svg$/ , use: "svg-inline-loader" },
			{ test: /\.css$/ , use: ["style-loader", "css-loader"] }
		]
	},
	plugins: [
		new BannerPlugin({
			banner: () => {
				const bnumPath = path.join(__dirname, "src", "meta", "build.num");
				if (!existsSync(bnumPath)) { writeFileSync(bnumPath, Buffer.from([0, 0, 0, 0])); }
				const bnum = readFileSync(bnumPath).readUint32BE();
				const bnumBuf = Buffer.allocUnsafe(4);
				bnumBuf.writeUInt32BE(bnum + 1);
				writeFileSync(bnumPath, bnumBuf);
				return readFileSync(path.join(__dirname, "src", "meta", "header.txt"), "utf-8")
					.replace("%BUILDNUM%", bnum.toString(36))
					.replace("%VERSION%", require("./package.json").version);
			},
			raw: true
		})
	],
	resolve: { extensions: [".tsx", ".ts", ".js"] },
	output: {
		path: __dirname,
		filename: "aladar.user.js"
	}
}