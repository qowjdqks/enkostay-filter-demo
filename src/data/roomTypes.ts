// 숙소 데이터 타입 정의
export type RoomType = '집 전체' | '개인실' | '다인실';
export type SpaceType = '개인 욕실' | '주방' | '복층';
export type BedType = '싱글' | '슈퍼싱글' | '퀸' | '킹' | '더블' | '2층 침대' | '소파베드';
export type Amenity = '세탁기' | '에어컨' | '난방' | '와이파이' | '엘리베이터' | '전자레인지' | '기타';
export type Support = '영상 투어 제공' | 'RC 서류 준비 완료';
export type Gender = '전체 성별' | '성별 무관' | '여성 전용' | '남성 전용';
export type Pet = '반려동물 동반 가능';
export type BuildingType = '오피스텔' | '고시원 / 원룸텔' | '브랜드 레지던스' | 'APT (아파트)' | '빌라' | '단독주택' | '레지던스 호텔' | '게스트하우스';
export type FloorType = '저층' | '중층' | '고층';

export interface RoomData {
  id: number;
  title: string;
  price: number; // 월 임대료 (만원 단위)
  roomType: RoomType[];
  spaceType: SpaceType[];
  bedType: BedType[];
  amenities: Amenity[];
  supports: Support[];
  gender: Gender;
  pet: boolean;
  buildingType: BuildingType;
  floorType: FloorType;
  image: string;
}

export const ROOM_TYPE_LIST: RoomType[] = ['집 전체', '개인실', '다인실'];
export const SPACE_TYPE_LIST: SpaceType[] = ['개인 욕실', '주방', '복층'];
export const BED_TYPE_LIST: BedType[] = ['싱글', '슈퍼싱글', '퀸', '킹', '더블', '2층 침대', '소파베드'];
export const AMENITY_LIST: Amenity[] = ['세탁기', '에어컨', '난방', '와이파이', '엘리베이터', '전자레인지', '기타'];
export const SUPPORT_LIST: Support[] = ['영상 투어 제공', 'RC 서류 준비 완료'];
export const GENDER_LIST: Gender[] = ['전체 성별', '성별 무관', '여성 전용', '남성 전용'];
export const BUILDING_TYPE_LIST: BuildingType[] = ['오피스텔', '고시원 / 원룸텔', '브랜드 레지던스', 'APT (아파트)', '빌라', '단독주택', '레지던스 호텔', '게스트하우스'];
export const FLOOR_TYPE_LIST: FloorType[] = ['저층', '중층', '고층'];
