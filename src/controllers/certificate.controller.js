import certificateService from '../services/certificate.service.js';

const claim = async (req, res) => {
  try {
    const { courseId } = req.body;
    const cert = await certificateService.claimCertificate(req.user.id, courseId);
    res.status(201).json({
      success: true,
      message: 'Cấp chứng chỉ thành công',
      data: cert,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Cấp chứng chỉ thất bại',
    });
  }
};

const listMine = async (req, res) => {
  try {
    const data = await certificateService.listMyCertificates(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getByCertNumber = async (req, res) => {
  try {
    const data = await certificateService.getByCertNumber(req.params.certNumber);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const verify = async (req, res) => {
  try {
    const data = await certificateService.verifyByCertNumber(req.params.certNumber);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const listAll = async (req, res) => {
  try {
    const data = await certificateService.listAllCertificates(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const revoke = async (req, res) => {
  try {
    const data = await certificateService.revokeCertificate(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Đã thu hồi chứng chỉ',
      data,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default { claim, listMine, getByCertNumber, verify, listAll, revoke };
