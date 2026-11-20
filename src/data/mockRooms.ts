import type { RoomData } from './roomTypes';
import { ROOM_TYPE_LIST, SPACE_TYPE_LIST, BED_TYPE_LIST, AMENITY_LIST, SUPPORT_LIST, GENDER_LIST, BUILDING_TYPE_LIST, FLOOR_TYPE_LIST } from './roomTypes';

function getRandom<T>(arr: T[], min: number, max: number) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length: count }, () => arr[Math.floor(Math.random() * arr.length)]);
}

export function generateMockRooms(count: number = 500): RoomData[] {
  return Array.from({ length: count }, (_, i) => {
    return {
      id: i + 1,
      title: `가상 숙소 ${i + 1}`,
      price: Math.floor(Math.random() * 32 + 18) * 10000, // 1.8M ~ 5.0M
      roomType: getRandom(ROOM_TYPE_LIST, 1, 2),
      spaceType: getRandom(SPACE_TYPE_LIST, 0, 2),
      bedType: getRandom(BED_TYPE_LIST, 1, 2),
      amenities: getRandom(AMENITY_LIST, 2, 5),
      supports: getRandom(SUPPORT_LIST, 0, 2),
      gender: GENDER_LIST[Math.floor(Math.random() * GENDER_LIST.length)],
      pet: Math.random() < 0.3,
      buildingType: BUILDING_TYPE_LIST[Math.floor(Math.random() * BUILDING_TYPE_LIST.length)],
      floorType: FLOOR_TYPE_LIST[Math.floor(Math.random() * FLOOR_TYPE_LIST.length)],
      image: `https://source.unsplash.com/featured/?room,${i}`
    };
  });
}
