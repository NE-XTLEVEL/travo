import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  validate, // class-validator의 programmatic API
} from "class-validator";
import { plainToInstance } from "class-transformer";
import { LocationDto } from "src/location/dto/request/location.dto";

@ValidatorConstraint({ name: "customDataValidation", async: true })
export class LocationDataValidator implements ValidatorConstraintInterface {
  private validation_errors: string[] = [];

  /* eslint-disable-next-line */
  async validate(dataPropertyValue: any, args: ValidationArguments) {
    this.validation_errors = []; // 각 검증마다 초기화

    // dataPropertyValue는 Record<string, LocationDto[]> 타입이어야 함
    if (typeof dataPropertyValue !== "object" || dataPropertyValue === null) {
      this.validation_errors.push("data 프로퍼티는 객체여야 합니다.");
      return false;
    }

    let overallValid = true;

    for (const key in dataPropertyValue) {
      if (Object.prototype.hasOwnProperty.call(dataPropertyValue, key)) {
        const locationArray = dataPropertyValue[key];

        if (!Array.isArray(locationArray)) {
          this.validation_errors.push(`data['${key}'] 값은 배열이어야 합니다.`);
          overallValid = false;
          continue; // 다음 키로 넘어감
        }

        for (let i = 0; i < locationArray.length; i++) {
          const locationPlainObject = locationArray[i];

          if (
            typeof locationPlainObject !== "object" ||
            locationPlainObject === null
          ) {
            this.validation_errors.push(
              `data['${key}'][${i}] 값은 객체여야 합니다.`,
            );
            overallValid = false;
            continue;
          }

          // 1. 평범한 객체를 LocationDto 인스턴스로 변환
          const locationInstance = plainToInstance(
            LocationDto,
            locationPlainObject,
          );

          // 2. LocationDto 인스턴스 유효성 검사
          const errors = await validate(locationInstance);
          if (errors.length > 0) {
            overallValid = false;
            // 에러 메시지 수집 및 재구성
            errors.forEach((error) => {
              Object.values(error.constraints || {}).forEach((message) => {
                this.validation_errors.push(
                  `data['${key}'][${i}].${error.property}: ${message}`,
                );
              });
            });
          }
        }
      }
    }
    return overallValid;
  }

  /* eslint-disable-next-line */
  defaultMessage(args: ValidationArguments) {
    // 수집된 모든 에러 메시지를 반환
    if (this.validation_errors.length > 0) {
      return this.validation_errors.join("; ");
    }
    // 이 메시지는 일반적으로 validate 메소드가 false를 반환하지만 validationErrors가 비어있을 때 표시됨 (예: 초기 타입 체크 실패)
    return `data 프로퍼티의 구조나 내용이 유효하지 않습니다. 각 값은 LocationDto 객체의 배열이어야 합니다.`;
  }
}
