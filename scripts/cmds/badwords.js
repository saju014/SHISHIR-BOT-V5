!cmd install badwords.js module.exports = {
	config: {
		name: "badwords",
		aliases: ["badword"],
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			vi: "Bật/tắt/thêm/xóa cảnh báo vi phạm từ thô tục, nếu thành viên vi phạm sẽ bị cảnh báo, lần 2 sẽ kick khỏi box chat",
			en: "Turn on/off/add/remove bad words warning, if a member violates, he will be warned, the second time he will be kicked out of the chat box"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} add <words>: thêm từ cấm (có thể thêm nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\""
				+ "\n   {pn} delete <words>: xóa từ cấm (có thể xóa nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\""
				+ "\n   {pn} list <hide | để trống>: tắt cảnh báo (thêm \"hide\" để ẩn từ cấm)"
				+ "\n   {pn} unwarn [<userID> | <@tag>]: xóa 1 lần cảnh báo của 1 thành viên"
				+ "\n   {pn} on: tắt cảnh báo"
				+ "\n   {pn} off: bật cảnh báo",
			en: "   {pn} add <words>: add banned words (you can add multiple words separated by commas \",\" or vertical bars \"|\")"
				+ "\n   {pn} delete <words>: delete banned words (you can delete multiple words separated by commas \",\" or vertical bars \"|\")"
				+ "\n   {pn} list <hide | leave blank>: turn off warning (add \"hide\" to hide banned words)"
				+ "\n   {pn} unwarn [<userID> | <@tag>]: remove 1 warning of 1 member"
				+ "\n   {pn} on: turn off warning"
				+ "\n   {pn} off: turn on warning"
		}
	},

	langs: {
		vi: {
			onText: "bật",
			offText: "tắt",
			onlyAdmin: "⚠️ | Chỉ quản trị viên mới có thể thêm từ cấm vào danh sách",
			missingWords: "⚠️ | Bạn chưa nhập từ cần cấm",
			addedSuccess: "✅ | Đã thêm %1 từ cấm vào danh sách",
			alreadyExist: "❌ | %1 từ cấm đã tồn tại trong danh sách từ trước: %2",
			tooShort: "⚠️ | %1 từ cấm không thể thêm vào danh sách do có độ dài nhỏ hơn 2 ký tự: %2",
			onlyAdmin2: "⚠️ | Chỉ quản trị viên mới có thể xóa từ cấm khỏi danh sách",
			missingWords2: "⚠️ | Bạn chưa nhập từ cần xóa",
			deletedSuccess: "✅ | Đã xóa %1 từ cấm khỏi danh sách",
			notExist: "❌ | %1 từ cấm không tồn tại trong danh sách từ trước: %2",
			emptyList: "⚠️ | Danh sách từ cấm trong nhóm bạn hiện đang trống",
			badWordsList: "📑 | Danh sách từ cấm trong nhóm bạn: %1",
			onlyAdmin3: "⚠️ | Chỉ quản trị viên mới có thể %1 tính năng này",
			turnedOnOrOff: "✅ | Cảnh báo vi phạm từ cấm đã %1",
			onlyAdmin4: "⚠️ | Chỉ quản trị viên mới có thể xóa cảnh báo vi phạm từ cấm",
			missingTarget: "⚠️ | Bạn chưa nhập ID người dùng hoặc tag người dùng",
			notWarned: "⚠️ | Người dùng %1 chưa bị cảnh báo vi phạm từ cấm",
			removedWarn: "✅ | Người dùng %1 | %2 đã được xóa bỏ 1 lần cảnh báo vi phạm từ cấm",
			warned: "⚠️ | Từ cấm \"%1\" đã được phát hiện trong tin nhắn của bạn, nếu tiếp tục vi phạm bạn sẽ bị kick khỏi nhóm.",
			warned2: "⚠️ | Từ cấm \"%1\" đã được phát hiện trong tin nhắn của bạn, bạn đã vi phạm 2 lần và sẽ bị kick khỏi nhóm.",
			needAdmin: "Bot cần quyền quản trị viên để kick thành viên bị ban",
			unwarned: "✅ | Đã xóa bỏ cảnh báo vi phạm từ cấm của người dùng %1 | %2"
		},
		en: {
			onText: "on",
			offText: "off",
			onlyAdmin: "⚠️ | Only admins can add banned words to the list",
			missingWords: "⚠️ | You haven't entered the banned words",
			addedSuccess: "✅ | Added %1 banned words to the list",
			alreadyExist: "❌ | %1 banned words already exist in the list before: %2",
			tooShort: "⚠️ | %1 banned words cannot be added to the list because they are shorter than 2 characters: %2",
			onlyAdmin2: "⚠️ | Only admins can delete banned words from the list",
			missingWords2: "⚠️ | You haven't entered the words to delete",
			deletedSuccess: "✅ | Deleted %1 banned words from the list",
			notExist: "❌ | %1 banned words do not exist in the list before: %2",
			emptyList: "⚠️ | The list of banned words in your group is currently empty",
			badWordsList: "📑 | The list of banned words in your group: %1",
			onlyAdmin3: "⚠️ | Only admins can %1 this feature",
			turnedOnOrOff: "✅ | Banned words warning has been %1",
			onlyAdmin4: "⚠️ | Only admins can delete banned words warning",
			missingTarget: "⚠️ | You haven't entered user ID or tagged user",
			notWarned: "⚠️ | User %1 has not been warned for banned words",
			removedWarn: "✅ | User %1 | %2 has been removed 1 banned words warning",
			warned: "⚠️ | Banned words \"%1\" have been detected in your message, if you continue to violate you will be kicked from the group.",
			warned2: "⚠️ | Banned words \"%1\" have been detected in your message, you have violated 2 times and will be kicked from the group.",
			needAdmin: "Bot needs admin privileges to kick banned members",
			unwarned: "✅ | Removed banned words warning of user %1 | %2"
		}
	},

	onStart: async function ({ message, event, args, threadsData, usersData, role, getLang }) {
		if (!await threadsData.get(event.threadID, "data.badWords"))
			await threadsData.set(event.threadID, {
				words: [],
				violationUsers: {}
