/* import { LogRepository, ParameterRepository } from '@shared/repositories';
import { app } from '@src/main'; */

class AppendBD {
  async deleteLog() {
    /* const logRepository = app.get(LogRepository);
    const parameterRepository = app.get(ParameterRepository);
    const months = await parameterRepository.findOne({
      idParameter: 'MONTHS_LOGS',
    });
    const now = new Date();
    // Restar 3 meses
    now.setMonth(now.getMonth() - parseInt(months.description));
    // Establecer el día al 1
    now.setDate(1);
    await logRepository.db.deleteMany({ startTime: { $lt: now } }).exec(); */
  }
  async insetLog(loggingEvent) {
    /* await this.deleteLog();
    const logRepository = app.get(LogRepository);
    const dataArray = loggingEvent.data.map((d) => {
      try {
        return JSON.parse(d);
      } catch (error) {
        return d;
      }
    });
    const data = dataArray.length > 0 ? dataArray[0] : [];
    if (data.responseBody) data.responseBody = JSON.parse(data.responseBody);

    const url = data?.url || '';
    const method = data?.method || '';
    const code = data?.code || '';
    delete data.url;
    delete data.method;
    delete data.code;

    const dataLog = {
      startTime: loggingEvent.startTime,
      categoryName: loggingEvent.categoryName,
      data,
      url,
      method,
      code,
      error: loggingEvent?.error || [],
      level: loggingEvent.level.levelStr,
    };
    await logRepository.save(dataLog); */
  }
  stdoutAppender(layout, timezoneOffset) {
    // This is the appender function itself
    return (loggingEvent) => {
      this.insetLog(loggingEvent);
    };
  }
}
// stdout configure doesn't need to use findAppender, or levels
function configure(config, layouts) {
  // the default layout for the appender
  let layout = layouts.colouredLayout;
  // check if there is another layout specified
  if (config.layout) {
    // load the layout
    layout = layouts.layout(config.layout.type, config.layout);
  }
  //create a new appender instance
  return new AppendBD().stdoutAppender(layout, config.timezoneOffset);
}
//export the only function needed
exports.configure = configure;
