import './style.scss';

function MobileView() {
  return (
    <div className="page-mobile">
      <div className="inner">
        <div className="box-img">
          <img src="/images/chunkyLogo.png" alt="chunky logo" />
        </div>
        <h1 className="title">PC버전으로 접속해주세요.</h1>
        <p className="desc">
          <img
            src="/images/chunkyMobileText.png"
            alt="chunky logo"
            className="text-img"
          />
          <span>는 PC환경에서 사용가능합니다.</span>
          <br />
        </p>
      </div>
    </div>
  );
}

export default MobileView;
