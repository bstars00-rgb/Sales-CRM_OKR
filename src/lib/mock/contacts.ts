import type { Contact } from "./types";

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "ct-101", accountId: "acc-001", firstName: "Nguyen", lastName: "Van Minh",
    title: "CEO", email: "minh@abctravel.vn", phone: "+84 90 123 4567",
    messengerKind: "ZALO", messengerId: "84090abc",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true,
  },
  {
    id: "ct-102", accountId: "acc-001", firstName: "Linh", lastName: "Tran",
    title: "Head of Sales", email: "linh@abctravel.vn", phone: "+84 90 234 5678",
    decisionPower: 3, influence: 4, relationshipTemp: "HOT", isPrimary: false,
  },
  {
    id: "ct-103", accountId: "acc-001", firstName: "Ho", lastName: "Quang",
    title: "Head of IT (API)", email: "ho@abctravel.vn",
    decisionPower: 2, influence: 3, relationshipTemp: "WARM", isPrimary: false,
  },
  {
    id: "ct-201", accountId: "acc-002", firstName: "Yuki", lastName: "Sato",
    title: "Director", email: "sato@xyz-dmc.jp",
    decisionPower: 4, influence: 4, relationshipTemp: "COOL", isPrimary: true,
  },
  {
    id: "ct-301", accountId: "acc-004", firstName: "Tuan", lastName: "Pham",
    title: "Founder & CEO", email: "tuan@hanoiskies.vn",
    messengerKind: "ZALO", messengerId: "84091xyz",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true,
  },
  {
    id: "ct-401", accountId: "acc-005", firstName: "이재형", title: "이사",
    email: "lee@jkltravel.kr", phone: "+82 10 1234 5678",
    messengerKind: "KAKAO", messengerId: "lee.jkl",
    decisionPower: 4, influence: 4, relationshipTemp: "WARM", isPrimary: true,
  },
];
