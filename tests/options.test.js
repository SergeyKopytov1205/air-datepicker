import {beforeAll, afterEach, describe, test, it, expect} from '@jest/globals';
import Datepicker from 'datepicker';
import {isSameDate} from 'utils';
import en from 'locale/en';
import de from 'locale/de';
import consts from 'consts';

let $input, $altInput, dp, $datepicker;

beforeAll(() => {
    $input = document.createElement('input');
    $altInput = document.createElement('input');
    document.body.appendChild($input);
    document.body.appendChild($altInput);
});

afterEach(() => {
    dp.destroy();
    dp = false;
    $datepicker = false;
});

function init(opts) {
    dp = new Datepicker($input, opts);
    $datepicker = dp.$datepicker;
}


describe('OPTIONS TESTS', () => {
    describe('classes', () => {
        it('should append custom classes to datepicker', () => {
            init({classes: 'custom-class'});
            expect($datepicker).toHaveClass('custom-class');
        });
    });

    describe('inline', () => {
        test('if datepicker has proper class', () => {
            init({inline: true});
            expect($datepicker).toHaveClass('-inline-');
        });
    });

    describe('locale', () => {
        it('should change locale to "en"', () => {
            init({locale: en});
            let currentMonthName = en.months[new Date().getMonth()];
            let $navMonth = $datepicker.querySelector('.datepicker-nav--title');

            expect($navMonth).toHaveTextContent(currentMonthName);
        });

        it('should modify inner locale object to the passed one', () => {
            init({locale: en});

            expect(dp.locale.days).toEqual(en.days);
        });

        it('should change locale string partially', () => {
            let daysMin = ['В','П','В','С','Ч','П','С'];

            init({
                locale: {
                    firstDay: 0,
                    daysMin
                }
            });

            let arrayFromHtml = [...$datepicker.querySelectorAll('.datepicker-body--day-name')].map(el => el.innerHTML);

            expect(arrayFromHtml).toEqual(daysMin);
        });
    });

    describe('startDate', () => {
        it('should change start date', () => {
            let startDate = new Date('2021-02-04');
            init({startDate});

            let $navMonth = $datepicker.querySelector('.datepicker-nav--title');

            expect($navMonth).toHaveTextContent('Февраль');
            expect(dp.viewDate).toEqual(startDate);
        });
    });

    describe('firstDay', () => {
        it('should change first day', () => {
            init({
                firstDay: 2
            });

            let $day = $datepicker.querySelectorAll('.datepicker-body--day-name')[0];

            expect($day).toHaveTextContent('Вт');
        });
    });


    describe('weekends', () => {
        it('should change days, which should considered to be weekends', () => {
            init({
                weekends: [0, 2],
                firstDay: 0
            });

            let $dayNames = $datepicker.querySelectorAll('.datepicker-body--day-name');

            expect($dayNames[0]).toHaveClass(consts.cssClassWeekend);
            expect($dayNames[2]).toHaveClass(consts.cssClassWeekend);
        });
    });


    describe('dateFormat', () => {
        let date = new Date('2021-04-28T23:05'),
            values = {
                'T': date.getTime().toString(),
                'aa': 'am',
                'AA': 'AM',
                'h': '23',
                'hh': '23',
                'm': '5',
                'mm': '05',
                'dd': '28',
                'd': '28',
                'EEEE': 'Среда',
                'E': 'Сре',
                'M': '4',
                'MM': '04',
                'MMM': 'Апр',
                'MMMM': 'Апрель',
                'yy': '21',
                'yyyy' : '2021',
                'yyyy1': '2020',
                'yyyy2': '2029'
            };

        for (let [dateFormat, value] of Object.entries(values)) {
            test(`should convert ${dateFormat} to ${value}`, (done) => {
                init({
                    dateFormat
                });

                dp.selectDate(date).then(() => {
                    expect(dp.$el.value).toEqual(value);
                    done();
                });
            });
        }

        it('should work with common text characters', (done) => {
            init({
                locale: de,
                dateFormat: 'Month is MMMM'
            });

            dp.selectDate(new Date(2016, 2, 1)).then(() => {
                expect(dp.$el.value).toEqual('Month is März');
                done();
            });
        });

        it('should work correctly with function as format value', (done) => {
            init({
                dateFormat: () => {
                    return 'custom format';
                }
            });

            dp.selectDate(new Date()).then(() => {
                expect(dp.$el.value).toEqual('custom format');
                done();
            });
        });
    });


    describe('altField', () => {
        it('should change value of "altField" when selecting date', (done) => {
            init({
                altField: $altInput,
            });

            let date = new Date();
            dp.selectDate(date).then(() => {
                expect($altInput.value).toEqual(date.getTime().toString());
                done();
            });
        });
    });

    describe('altFieldDateFormat', () => {
        it('should change date format of "altField"', (done) => {
            init({
                altField: $altInput,
                altFieldDateFormat: 'MMMM'
            });

            let date = new Date();
            dp.selectDate(date).then(() => {
                expect($altInput.value).toEqual(dp.locale.months[date.getMonth()]);
                done();
            });
        });
    });

    describe('toggleSelected', () => {
        it('should remove selection from active date when clicked', function () {
            let date = new Date();

            init({
                toggleSelected: true
            });

            dp.selectDate(date);
            dp.getCell(date).click();

            expect(dp.selectedDates).toHaveLength(0);
        });

        it('should not remove selection from active date when clicked', function () {
            let date = new Date();

            init({
                toggleSelected: false
            });

            dp.selectDate(date);
            dp.getCell(date).click();

            expect(dp.selectedDates).toHaveLength(1);
        });
    });

    describe('keyboardNav', () => {
        var year = 2015,
            month = 10,
            day = 18,
            date = new Date(year, month, day),
            cases = [
                {
                    description: '→: should focus next cell',
                    which: 39,
                    keys: 'ArrowRight',
                    validDate: new Date(year, month, day + 1)
                },
                {
                    description: '←: should focus previous cell',
                    which: 37,
                    keys: 'ArrowLeft',
                    validDate: new Date(year, month, day - 1)
                },
                {
                    description: '↑: should focus -7 day cell',
                    which: 38,
                    keys: 'ArrowUp',
                    validDate: new Date(year, month, day - 7)
                },
                {
                    description: '↓: should focus +7 day cell',
                    which: 40,
                    keys: 'ArrowDown',
                    validDate: new Date(year, month, day + 7)
                },
                {
                    description: 'Ctrl + →: should focus next month',
                    keys: ['Control', 'ArrowRight'],
                    validDate: new Date(year, month + 1, day)
                },
                {
                    description: 'Ctrl + ←: should focus previous month',
                    keys: ['Control', 'ArrowLeft'],
                    validDate: new Date(year, month - 1, day)
                },
                {
                    description: 'Shift + →: should focus next year',
                    keys: ['Shift', 'ArrowRight'],
                    validDate: new Date(year + 1, month, day)
                },
                {
                    description: 'Shift + ←: should focus previous year',
                    keys: ['Shift', 'ArrowLeft'],
                    validDate: new Date(year - 1, month, day)
                },
                {
                    description: 'Alt + →: should focus on +10 year cell',
                    keys: ['Alt', 'ArrowRight'],
                    validDate: new Date(year + 10, month, day)
                },
                {
                    description: 'Alt + ←: should focus on -10 year cell',
                    keys: ['Alt', 'ArrowLeft'],
                    validDate: new Date(year - 10, month, day)
                },
                {
                    description: 'Ctrl + Shift + ↑: should change view to months',
                    keys: ['Control', 'Shift', 'ArrowUp'],
                    view: 'months'
                }
            ];

        cases.forEach(({description, which, keys, validDate, view}) => {
            test(description, () => {
                init();
                dp.selectDate(date);

                // IF arrow key
                if (which && !Array.isArray(which)) {
                    let event = new KeyboardEvent('keydown', {which, key: keys});
                    dp.$el.dispatchEvent(event);
                } else {
                    if (which) {
                        which.forEach((keyCode) => {
                            let event = new KeyboardEvent('keydown', {which: keyCode});
                            dp.$el.dispatchEvent(event);
                        });
                    }
                    if (keys) {
                        keys.forEach((key) => {
                            let event = new KeyboardEvent('keydown', {key});
                            dp.$el.dispatchEvent(event);
                        });
                    }
                }


                let {focusDate} = dp;

                if (validDate) {
                    expect(validDate.getFullYear()).toEqual(focusDate.getFullYear());
                    expect(validDate.getMonth()).toEqual(focusDate.getMonth());
                    expect(validDate.getDate()).toEqual(focusDate.getDate());
                }

                if (view) {
                    expect(view).toEqual(dp.currentView);
                }

            });
        });
    });
});