import type { Dispatch, SetStateAction } from 'react';

export type TopicKey = 'room' | 'amenity' | 'support' | 'building' | 'floor';

interface Priority {
  key: TopicKey;
  label: string;
  required: boolean;
}

export default function FilterPanel({
  priorityList,
  setPriorityList,
}: {
  priorityList: Priority[];
  setPriorityList: Dispatch<SetStateAction<Priority[]>>;
}) {
  // 드래그 앤 드롭, 필수 체크박스 등은 추후 구현
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400 }}>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>검색 우선순위 설정</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {priorityList.map((topic, idx) => (
          <li key={topic.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ cursor: 'grab', marginRight: 12 }}>☰</span>
            <span style={{ width: 48, fontWeight: 600 }}>{idx + 1}순위</span>
            <span style={{ flex: 1 }}>{topic.label}</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="checkbox"
                checked={topic.required}
                onChange={() => {
                  setPriorityList((prev) =>
                    prev.map((t, i) =>
                      i === idx ? { ...t, required: !t.required } : t
                    )
                  );
                }}
              />
              필수
            </label>
          </li>
        ))}
      </ul>
      {/* 실제 드래그 앤 드롭은 추후 구현 */}
    </div>
  );
}
